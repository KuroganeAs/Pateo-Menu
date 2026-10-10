import React from 'react';

// Language tabs: '' edits the canonical English fields; the suffixes edit the
// optional translations (empty = customers see English for that language).
const LANGS = [
  { suffix: '', label: 'English' },
  { suffix: '_pt', label: 'Português' },
  { suffix: '_tet', label: 'Tetun' },
];

export default function LanguageTabs({ value, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 bg-background-alt rounded-xl p-1 w-fit ${className}`}>
      {LANGS.map(({ suffix, label }) => (
        <button
          key={suffix}
          type="button"
          onClick={() => onChange(suffix)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            value === suffix ? 'bg-white shadow-card text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          {label}
        </button>
      ))}
      {value !== '' && (
        <span className="text-[10px] text-muted px-2">empty = English shown</span>
      )}
    </div>
  );
}
