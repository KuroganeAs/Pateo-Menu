import React, { useRef, useState } from 'react';
import { Plus, Trash2, X, Upload } from 'lucide-react';
import { api, resolveImageUrl } from '../lib/api';

const emptyGroup = () => ({ name: '', selection_type: 'single', required: false, options: [emptyOption()] });
const emptyOption = () => ({ name: '', price_delta: 0 });

export default function ItemEditor({ item, categoryId, categories, onClose, onSaved }) {
  const isNew = !item;
  const [form, setForm] = useState(() => ({
    name: item?.name ?? '',
    description: item?.description ?? '',
    price: item?.price ?? 0,
    category_id: item?.category_id ?? categoryId,
    display_order: item?.display_order ?? 0,
    is_available: item?.is_available ?? true,
    image_url: item?.image_url ?? null,
    modifier_groups: (item?.modifier_groups ?? []).map((g) => ({
      name: g.name,
      selection_type: g.selection_type,
      required: g.required,
      options: g.options.map((o) => ({ name: o.name, price_delta: o.price_delta })),
    })),
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null); // upload for NEW items happens after create
  const previewUrl = pendingFile ? URL.createObjectURL(pendingFile) : resolveImageUrl(form.image_url);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setGroup = (gi, patch) =>
    set({ modifier_groups: form.modifier_groups.map((g, i) => (i === gi ? { ...g, ...patch } : g)) });
  const setOption = (gi, oi, patch) =>
    setGroup(gi, {
      options: form.modifier_groups[gi].options.map((o, i) => (i === oi ? { ...o, ...patch } : o)),
    });

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        display_order: Number(form.display_order) || 0,
        modifier_groups: form.modifier_groups
          .filter((g) => g.name.trim())
          .map((g) => ({
            ...g,
            options: g.options
              .filter((o) => o.name.trim())
              .map((o) => ({ name: o.name.trim(), price_delta: Number(o.price_delta) || 0 })),
          })),
      };
      let saved;
      if (isNew) {
        saved = await api.post('/api/items', payload);
      } else {
        saved = await api.put(`/api/items/${item.id}`, payload);
      }
      if (pendingFile) {
        await api.upload(`/api/items/${saved.id}/image`, pendingFile);
      }
      onSaved();
    } catch (e) {
      setError(typeof e.detail === 'string' ? e.detail : e.message);
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 grid place-items-center p-4" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-card-hover p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{isNew ? 'New item' : `Edit "${item.name}"`}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:bg-background-alt"><X size={18} /></button>
        </header>

        <div className="flex gap-4 items-start">
          {/* Image + upload */}
          <div className="shrink-0 space-y-2">
            <div className="w-28 h-28 rounded-xl bg-background-alt overflow-hidden grid place-items-center">
              {previewUrl
                ? <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                : <span className="text-xs text-muted px-2 text-center">No photo</span>}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-28 inline-flex items-center justify-center gap-1 text-xs font-semibold rounded-lg bg-background-alt px-2 py-1.5 hover:bg-stone-200"
            >
              <Upload size={13} /> {pendingFile ? 'Change' : 'Upload'}
            </button>
            {pendingFile && <p className="text-[10px] text-muted w-28 truncate">{pendingFile.name}</p>}
          </div>

          {/* Core fields */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            <label className="col-span-2 block">
              <span className="text-xs font-semibold text-muted">Name</span>
              <input className={input} value={form.name} onChange={(e) => set({ name: e.target.value })} />
            </label>
            <label className="col-span-2 block">
              <span className="text-xs font-semibold text-muted">Description</span>
              <textarea rows={2} className={input} value={form.description ?? ''} onChange={(e) => set({ description: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted">Base price ($)</span>
              <input type="number" step="0.05" min="0" className={input} value={form.price} onChange={(e) => set({ price: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted">Category</span>
              <select className={input} value={form.category_id} onChange={(e) => set({ category_id: Number(e.target.value) })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted">Display order</span>
              <input type="number" className={input} value={form.display_order} onChange={(e) => set({ display_order: e.target.value })} />
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input type="checkbox" checked={form.is_available} onChange={(e) => set({ is_available: e.target.checked })} />
              Available
            </label>
          </div>
        </div>

        {/* Modifier groups */}
        <section className="space-y-3">
          <header className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wide text-muted">Modifier groups</h4>
            <button
              onClick={() => set({ modifier_groups: [...form.modifier_groups, emptyGroup()] })}
              className="inline-flex items-center gap-1 text-xs font-semibold rounded-lg bg-background-alt px-2.5 py-1.5 hover:bg-stone-200"
            >
              <Plus size={13} /> Group
            </button>
          </header>

          {form.modifier_groups.map((group, gi) => (
            <div key={gi} className="rounded-xl border border-stone-200 p-3 space-y-2 bg-background/60">
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  placeholder="Group name (e.g. Size)"
                  className={`${input} flex-1 min-w-36`}
                  value={group.name}
                  onChange={(e) => setGroup(gi, { name: e.target.value })}
                />
                <select
                  className={`${input} w-auto`}
                  value={group.selection_type}
                  onChange={(e) => setGroup(gi, { selection_type: e.target.value })}
                >
                  <option value="single">single (radio)</option>
                  <option value="multiple">multiple (checkbox)</option>
                </select>
                <label className="flex items-center gap-1.5 text-xs font-medium">
                  <input type="checkbox" checked={group.required} onChange={(e) => setGroup(gi, { required: e.target.checked })} />
                  required
                </label>
                <button
                  onClick={() => set({ modifier_groups: form.modifier_groups.filter((_, i) => i !== gi) })}
                  title="Remove group"
                  className="p-1.5 rounded-lg text-muted hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {group.options.map((opt, oi) => (
                <div key={oi} className="flex gap-2 items-center pl-3">
                  <input
                    placeholder="Option name (e.g. Large)"
                    className={`${input} flex-1`}
                    value={opt.name}
                    onChange={(e) => setOption(gi, oi, { name: e.target.value })}
                  />
                  <label className="flex items-center gap-1 text-xs text-muted">
                    +$
                    <input
                      type="number"
                      step="0.05"
                      className={`${input} w-20`}
                      value={opt.price_delta}
                      onChange={(e) => setOption(gi, oi, { price_delta: e.target.value })}
                    />
                  </label>
                  <button
                    onClick={() => setGroup(gi, { options: group.options.filter((_, i) => i !== oi) })}
                    title="Remove option"
                    className="p-1 rounded text-muted hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setGroup(gi, { options: [...group.options, emptyOption()] })}
                className="ml-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Plus size={12} /> option
              </button>
            </div>
          ))}
          {form.modifier_groups.length === 0 && (
            <p className="text-xs text-muted">No modifiers — the item is ordered as-is.</p>
          )}
        </section>

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

        <footer className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-muted hover:bg-background-alt">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy || !form.name.trim()}
            className="rounded-xl bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
          >
            {busy ? 'Saving…' : isNew ? 'Create item' : 'Save changes'}
          </button>
        </footer>
      </div>
    </div>
  );
}
