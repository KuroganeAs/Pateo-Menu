import React, { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { api, resolveImageUrl } from '../lib/api';

// Weekly promo posters shown in the customer site's landing carousel.
// Upload the week's images (square looks best) — several at once via the
// picker or drag & drop — optionally caption them, order them, and
// toggle/delete old ones. Posters can be multi-selected for bulk deletion.
export default function Promo() {
  const [promos, setPromos] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [progress, setProgress] = useState(null); // { verb, done, total } during bulk work
  const [selected, setSelected] = useState(() => new Set()); // promo ids marked for bulk delete
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const load = () =>
    api
      .get('/api/promos/all')
      .then((list) => {
        setPromos(list);
        // Drop selections for posters that no longer exist
        setSelected((sel) => new Set(list.filter((p) => sel.has(p.id)).map((p) => p.id)));
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      await load();
    } catch (e) {
      setError(typeof e.detail === 'string' ? e.detail : e.message);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  // Upload every picked/dropped image; the caption (if any) applies to each.
  const uploadPosters = (fileList) => {
    const files = Array.from(fileList ?? []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    run(async () => {
      const failures = [];
      for (let i = 0; i < files.length; i++) {
        setProgress({ verb: 'Uploading', done: i, total: files.length });
        try {
          await api.upload('/api/promos', files[i], { caption: newCaption.trim() });
        } catch (e) {
          failures.push(`${files[i].name}: ${typeof e.detail === 'string' ? e.detail : e.message}`);
        }
      }
      setNewCaption('');
      if (failures.length) {
        setError(`${failures.length} of ${files.length} upload(s) failed — ${failures.join('; ')}`);
      }
    });
  };

  const toggleSelect = (id) =>
    setSelected((sel) => {
      const next = new Set(sel);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allSelected = promos?.length > 0 && selected.size === promos.length;
  const toggleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(promos.map((p) => p.id)));

  const deleteSelected = () => {
    const ids = promos.filter((p) => selected.has(p.id)).map((p) => p.id);
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} poster(s)? The image files are removed too.`)) return;
    run(async () => {
      const failures = [];
      for (let i = 0; i < ids.length; i++) {
        setProgress({ verb: 'Deleting', done: i, total: ids.length });
        try {
          await api.delete(`/api/promos/${ids[i]}`);
        } catch (e) {
          failures.push(typeof e.detail === 'string' ? e.detail : e.message);
        }
      }
      if (failures.length) {
        setError(`${failures.length} of ${ids.length} delete(s) failed — ${failures.join('; ')}`);
      }
    });
  };

  const saveCaption = (promo, caption) => {
    const next = caption.trim() || null;
    if (next === (promo.caption ?? null)) return;
    run(() => api.patch(`/api/promos/${promo.id}`, { caption: next }));
  };

  const toggleActive = (promo) =>
    run(() => api.patch(`/api/promos/${promo.id}`, { is_active: !promo.is_active }));

  const remove = (promo) => {
    if (!window.confirm('Delete this poster? The image file is removed too.')) return;
    run(() => api.delete(`/api/promos/${promo.id}`));
  };

  // Swap display_order with the neighbour in the given direction
  const move = (idx, dir) => {
    const other = idx + dir;
    if (other < 0 || other >= promos.length) return;
    const a = promos[idx];
    const b = promos[other];
    run(async () => {
      // Orders may be equal on legacy rows; force distinct values on swap
      await api.patch(`/api/promos/${a.id}`, { display_order: b.display_order === a.display_order ? b.display_order + (dir > 0 ? 1 : -1) : b.display_order });
      await api.patch(`/api/promos/${b.id}`, { display_order: a.display_order });
    });
  };

  if (!promos) {
    return error
      ? <p className="text-sm text-red-700">{error}</p>
      : <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="max-w-3xl space-y-5">
      <header>
        <h2 className="text-2xl font-bold">Weekly promos</h2>
        <p className="text-sm text-muted">
          The posters shown in the customer site's carousel, in this order. Square (1:1)
          images look best. Captions are optional.
        </p>
      </header>

      {/* Upload — accepts multiple files, picked or dropped */}
      <section
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadPosters(e.dataTransfer.files); }}
        className={`bg-surface rounded-2xl shadow-card p-5 space-y-3 border-2 border-dashed transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-transparent'
        }`}
      >
        <p className="font-semibold text-sm">Add this week's posters</p>
        <input
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="Caption (optional, applied to every uploaded image) — e.g. 30% off Aperol Spritz, 5–7pm"
          value={newCaption}
          onChange={(e) => setNewCaption(e.target.value)}
        />
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            uploadPosters(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
          >
            <Upload size={15} />
            {progress
              ? `${progress.verb} ${progress.done + 1}/${progress.total}…`
              : busy ? 'Working…' : 'Upload posters'}
          </button>
          <span className="text-xs text-muted">or drag & drop images here — several at once is fine</span>
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
      )}

      {/* Bulk-select bar */}
      {promos.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-primary"
            />
            Select all
          </label>
          {selected.size > 0 && (
            <button
              onClick={deleteSelected}
              disabled={busy}
              className="inline-flex items-center gap-1 text-xs font-semibold rounded-lg px-2.5 py-1.5 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 size={13} /> Delete selected ({selected.size})
            </button>
          )}
        </div>
      )}

      {/* Poster list */}
      {promos.length === 0 ? (
        <p className="text-sm text-muted">No posters yet — upload the first one above.</p>
      ) : (
        <ul className="space-y-3">
          {promos.map((promo, idx) => (
            <li
              key={promo.id}
              className={`bg-surface rounded-2xl shadow-card p-4 flex items-start gap-3 ${
                selected.has(promo.id) ? 'ring-2 ring-primary/60' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(promo.id)}
                onChange={() => toggleSelect(promo.id)}
                title="Select for bulk delete"
                className="w-4 h-4 mt-1 accent-primary shrink-0"
              />
              <img
                src={resolveImageUrl(promo.image_url)}
                alt=""
                className="w-28 h-28 rounded-xl object-cover bg-background-alt shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-2">
                <textarea
                  rows={2}
                  defaultValue={promo.caption ?? ''}
                  placeholder="No caption"
                  onBlur={(e) => saveCaption(promo, e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => toggleActive(promo)}
                    disabled={busy}
                    className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 ${
                      promo.is_active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-200 text-muted hover:bg-stone-300'
                    }`}
                  >
                    {promo.is_active ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={busy || idx === 0}
                    title="Move up"
                    className="p-1.5 rounded-lg text-muted hover:bg-background-alt disabled:opacity-30"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={busy || idx === promos.length - 1}
                    title="Move down"
                    className="p-1.5 rounded-lg text-muted hover:bg-background-alt disabled:opacity-30"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    onClick={() => remove(promo)}
                    disabled={busy}
                    className="ml-auto inline-flex items-center gap-1 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
