"""Shared validated image-upload utility with two storage backends.

Validation (both backends):
- content type must be jpeg/png/webp/gif — checked against BOTH the declared
  Content-Type and the file's magic bytes (the client's word is not trusted);
- size capped at settings.max_upload_mb.

Storage:
- When the CLOUDINARY_* settings are configured, images go to Cloudinary and
  the stored URL is the absolute https://res.cloudinary.com/... address. This
  is the production mode for hosts with ephemeral disks (e.g. Render free).
- Otherwise images land on local disk under uploads/<subfolder>/ with a random
  hex filename and the URL is the relative "/uploads/<subfolder>/<name>" path
  served by the StaticFiles mount. This is the zero-setup local-dev mode.

delete_uploaded_image() reverses either kind of URL, best-effort.
"""
import logging
import re
import secrets
from pathlib import Path

from fastapi import HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from .config import settings

log = logging.getLogger("uploads")

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
CHUNK = 64 * 1024

if settings.cloudinary_enabled:
    import cloudinary
    import cloudinary.uploader

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


def _sniff(head: bytes) -> str | None:
    """Return the detected image content-type from magic bytes, or None."""
    if head.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if head.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "image/webp"
    return None


_EXT = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}


def store_image_bytes(data: bytes, subfolder: str, ext: str) -> str:
    """Store validated image bytes; returns the URL to persist.

    Used by the upload endpoints and by seed_promos, so both go through the
    same storage backend.
    """
    if settings.cloudinary_enabled:
        try:
            result = cloudinary.uploader.upload(
                data,
                folder=f"pateo/{subfolder}",
                resource_type="image",
            )
        except Exception:
            log.exception("Cloudinary upload failed")
            raise HTTPException(status_code=502, detail="Image storage (Cloudinary) rejected the upload.")
        return result["secure_url"]

    name = secrets.token_hex(16) + ext
    target_dir = Path(settings.upload_dir) / subfolder
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / name
    try:
        target.write_bytes(data)
    except OSError:
        target.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Failed to store the uploaded file.")
    return f"/uploads/{subfolder}/{name}"


async def save_image_upload(file: UploadFile, subfolder: str) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported image type '{file.content_type}'. Allowed: jpeg, png, webp, gif.",
        )

    max_bytes = settings.max_upload_bytes
    head = await file.read(16)
    detected = _sniff(head)
    if detected is None or detected not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="File content is not a valid jpeg/png/webp/gif image.")

    # Read fully (bounded by the size cap) so either backend can take the bytes.
    buf = bytearray(head)
    while chunk := await file.read(CHUNK):
        buf.extend(chunk)
        if len(buf) > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"Image exceeds the {settings.max_upload_mb}MB limit.",
            )

    if settings.cloudinary_enabled:
        # SDK is synchronous — keep the event loop free during the transfer.
        return await run_in_threadpool(store_image_bytes, bytes(buf), subfolder, _EXT[detected])
    return store_image_bytes(bytes(buf), subfolder, _EXT[detected])


# Matches the public_id inside one of OUR Cloudinary URLs:
# https://res.cloudinary.com/<cloud>/image/upload/v123/pateo/promo/abc.jpg
_CLOUDINARY_ID = re.compile(r"/image/upload/(?:v\d+/)?(.+?)\.[A-Za-z0-9]+$")


def delete_uploaded_image(url: str | None) -> None:
    """Best-effort cleanup of a previously stored image when it is replaced
    or its row is deleted. Handles both storage backends; never raises."""
    if not url:
        return

    if url.startswith("/uploads/"):
        rel = url.removeprefix("/uploads/")
        path = (Path(settings.upload_dir) / rel).resolve()
        try:
            # Refuse to escape the uploads directory (defense-in-depth).
            path.relative_to(Path(settings.upload_dir).resolve())
            path.unlink(missing_ok=True)
        except (ValueError, OSError):
            pass
        return

    if settings.cloudinary_enabled and settings.cloudinary_cloud_name in url:
        match = _CLOUDINARY_ID.search(url)
        if not match:
            return
        try:
            cloudinary.uploader.destroy(match.group(1), resource_type="image")
        except Exception:
            log.exception("Cloudinary delete failed for %s", url)
