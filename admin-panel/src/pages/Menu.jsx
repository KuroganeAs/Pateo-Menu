import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ImageOff, Globe } from 'lucide-react';
import { api, resolveImageUrl } from '../lib/api';
import { money } from '../lib/format';
import ItemEditor from '../components/ItemEditor';

export default function Menu() {
  const [menu, setMenu] = useState([]); // categories with nested items
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // {item|null, categoryId} -> editor open
  const [newCatName, setNewCatName] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.get('/api/menu');
      setMenu(data.categories);
      setError('');
    } catch (e) {
      setError(`Could not load menu: ${e.message}`);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (fn) => {
    try { await fn(); await load(); } catch (e) { setError(e.detail || e.message); }
  };

  const addCategory = () =>
    run(async () => {
      const name = newCatName.trim();
      if (!name) return;
      await api.post('/api/categories', { name, display_order: menu.length });
      setNewCatName('');
    });

  return (
    <div className="space-y-5 max-w-5xl">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Menu</h2>
          <p className="text-sm text-muted">Categories, items, modifiers, photos and availability.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            placeholder="New category name…"
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            onClick={addCategory}
            className="inline-flex items-center gap-1 rounded-xl bg-primary text-white text-sm font-semibold px-3 py-2 hover:bg-primary-dark"
          >
            <Plus size={15} /> Category
          </button>
        </div>
      </header>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
      )}

      {menu.map((cat) => (
        <CategorySection
          key={cat.id}
          category={cat}
          onSave={(fields) =>
            run(() =>
              api.put(`/api/categories/${cat.id}`, {
                name: cat.name,
                name_pt: cat.name_pt ?? null,
                name_tet: cat.name_tet ?? null,
                display_order: cat.display_order,
                ...fields,
              })
            )
          }
          onDelete={() => {
            if (window.confirm(`Delete category "${cat.name}" AND its ${cat.items.length} item(s)? Past orders keep their snapshots.`)) {
              run(() => api.delete(`/api/categories/${cat.id}`));
            }
          }}
          onAddItem={() => setEditing({ item: null, categoryId: cat.id })}
          onEditItem={(item) => setEditing({ item, categoryId: cat.id })}
          onDeleteItem={(item) => {
            if (window.confirm(`Delete "${item.name}"? Past orders keep their snapshots.`)) {
              run(() => api.delete(`/api/items/${item.id}`));
            }
          }}
          onToggleAvailability={(item) =>
            run(() => api.patch(`/api/items/${item.id}/availability`, { is_available: !item.is_available }))
          }
        />
      ))}

      {menu.length === 0 && !error && (
        <p className="text-sm text-muted">No categories yet — create one above, or seed the demo menu (see backend README).</p>
      )}

      {editing && (
        <ItemEditor
          item={editing.item}
          categoryId={editing.categoryId}
          categories={menu}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function CategorySection({ category, onSave, onDelete, onAddItem, onEditItem, onDeleteItem, onToggleAvailability }) {
  const [name, setName] = useState(category.name);
  const [namePt, setNamePt] = useState(category.name_pt ?? '');
  const [nameTet, setNameTet] = useState(category.name_tet ?? '');
  const [showLangs, setShowLangs] = useState(false);
  useEffect(() => setName(category.name), [category.name]);
  useEffect(() => setNamePt(category.name_pt ?? ''), [category.name_pt]);
  useEffect(() => setNameTet(category.name_tet ?? ''), [category.name_tet]);

  const langInput =
    'rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 min-w-40';

  return (
    <section className="bg-surface rounded-2xl shadow-card p-4 space-y-3">
      <header className="flex items-center gap-2 flex-wrap">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name !== category.name && onSave({ name: name.trim() })}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="font-bold text-lg bg-transparent border-b border-transparent hover:border-stone-300 focus:border-primary outline-none min-w-40"
        />
        <span className="text-xs text-muted">{category.items.length} items</span>
        <button
          onClick={() => setShowLangs((v) => !v)}
          title="Translations (PT / Tetun)"
          className={`p-1.5 rounded-lg hover:bg-background-alt ${showLangs ? 'text-primary' : 'text-muted'}`}
        >
          <Globe size={15} />
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={onAddItem}
            className="inline-flex items-center gap-1 text-xs font-semibold rounded-lg bg-background-alt px-2.5 py-1.5 hover:bg-stone-200"
          >
            <Plus size={13} /> Item
          </button>
          <button onClick={onDelete} title="Delete category" className="p-1.5 rounded-lg text-muted hover:bg-red-50 hover:text-red-600">
            <Trash2 size={15} />
          </button>
        </div>
      </header>

      {showLangs && (
        <div className="flex gap-3 flex-wrap items-end bg-background/60 border border-stone-200 rounded-xl p-3">
          <label className="block">
            <span className="text-xs font-semibold text-muted">Português</span>
            <input
              className={langInput}
              value={namePt}
              placeholder={category.name}
              onChange={(e) => setNamePt(e.target.value)}
              onBlur={() => (namePt.trim() || null) !== (category.name_pt ?? null) && onSave({ name_pt: namePt.trim() || null })}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted">Tetun</span>
            <input
              className={langInput}
              value={nameTet}
              placeholder={category.name}
              onChange={(e) => setNameTet(e.target.value)}
              onBlur={() => (nameTet.trim() || null) !== (category.name_tet ?? null) && onSave({ name_tet: nameTet.trim() || null })}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          </label>
          <p className="text-xs text-muted pb-2">Empty = customers see the English name.</p>
        </div>
      )}

      <div className="divide-y divide-stone-200/60">
        {category.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-2.5">
            {item.image_url ? (
              <img
                src={resolveImageUrl(item.image_url)}
                alt=""
                className="w-11 h-11 rounded-lg object-cover bg-background-alt"
                onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
              />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-background-alt grid place-items-center text-muted">
                <ImageOff size={16} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold truncate ${item.is_available ? '' : 'text-muted line-through'}`}>
                {item.name}
              </p>
              <p className="text-xs text-muted truncate">
                {money(item.price)}
                {item.modifier_groups.length > 0 && ` · ${item.modifier_groups.length} modifier group(s)`}
              </p>
            </div>
            {/* One-click Sold Out / In Stock — deliberately not buried in the edit form */}
            <button
              onClick={() => onToggleAvailability(item)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                item.is_available
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {item.is_available ? 'In stock' : 'Sold out'}
            </button>
            <button onClick={() => onEditItem(item)} title="Edit" className="p-1.5 rounded-lg text-muted hover:bg-background-alt">
              <Pencil size={15} />
            </button>
            <button onClick={() => onDeleteItem(item)} title="Delete" className="p-1.5 rounded-lg text-muted hover:bg-red-50 hover:text-red-600">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {category.items.length === 0 && <p className="text-xs text-muted py-2">No items yet.</p>}
      </div>
    </section>
  );
}
