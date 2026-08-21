"""Shared validated image-upload utility.

Rules (see README):
- content type must be jpeg/png/webp/gif — checked against BOTH the declared
  Content-Type and the file's magic bytes (the client's word is not trusted);
- size capped at settings.max_upload_mb (read in chunks, so an oversized body
  is rejected without buffering it whole);
- stored under uploads/<subfolder>/ with a random hex filename; the extension
  comes from the detected type, never from the client's filename.
Returns the public URL path ("/uploads/<subfolder>/<name>").
"""
import secrets
from pathlib import Path

from fastapi import HTTPException, UploadFile

from .config import settings

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
CHUNK = 64 * 1024


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

    # Random name from detected type — the client-provided filename is ignored.
    name = secrets.token_hex(16) + _EXT[detected]
    target_dir = Path(settings.upload_dir) / subfolder
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / name

    size = len(head)
    try:
        with open(target, "wb") as out:
            out.write(head)
            while chunk := await file.read(CHUNK):
                size += len(chunk)
                if size > max_bytes:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Image exceeds the {settings.max_upload_mb}MB limit.",
                    )
                out.write(chunk)
    except HTTPException:
        target.unlink(missing_ok=True)
        raise
    except OSError:
        target.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Failed to store the uploaded file.")

    return f"/uploads/{subfolder}/{name}"


def delete_upload_if_local(url: str | None) -> None:
    """Best-effort cleanup of a previously uploaded file when it is replaced.
    Only touches files that live under our own /uploads mount."""
    if not url or not url.startswith("/uploads/"):
        return
    rel = url.removeprefix("/uploads/")
    path = (Path(settings.upload_dir) / rel).resolve()
    try:
        # Refuse to escape the uploads directory (defense-in-depth).
        path.relative_to(Path(settings.upload_dir).resolve())
        path.unlink(missing_ok=True)
    except (ValueError, OSError):
        pass
