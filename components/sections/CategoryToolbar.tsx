import React, { useState } from 'react';
import { Category } from '../../types';

interface CategoryToolbarProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

const CategoryToolbar: React.FC<CategoryToolbarProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    onAddCategory(newCategoryName);
    setNewCategoryName('');
  };

  return (
    <section className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6">
      <div className="w-full md:w-auto flex items-center h-8">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Categories</h2>
      </div>
      <div className="flex-1 flex flex-wrap items-center gap-4">
        <form onSubmit={handleAddCategory} className="flex items-center gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category..."
            className="px-4 h-8 border border-slate-200 bg-slate-50 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-800 min-w-[160px] transition-all"
          />
          <button
            type="submit"
            className="bg-slate-800 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-900 transition-colors shadow-sm active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </form>

        <div className="h-6 w-px bg-slate-100 hidden md:block" />

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group flex items-center gap-2 px-3 h-8 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-600 shadow-sm hover:border-slate-300 transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${category.color}`} />
              {category.name}
              <button
                onClick={() => onDeleteCategory(category.id)}
                className="text-slate-300 hover:text-rose-500 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryToolbar;
