import React, { useState } from 'react';
import type { Category } from '@/types';

interface SettingsPanelProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ categories, onAddCategory, onDeleteCategory }) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setNewCategoryName('');
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Manage board categories.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Create category</h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name..."
            className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="h-11 rounded-xl bg-slate-800 px-4 text-sm font-bold text-white hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Add category
          </button>
        </form>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Existing categories</h3>
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-400">
            No categories yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className={`h-2.5 w-2.5 rounded-full ${category.color}`} />
                  <span className="truncate text-sm font-semibold text-slate-700">{category.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteCategory(category.id)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  title="Delete category"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SettingsPanel;
