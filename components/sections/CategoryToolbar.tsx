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
  const [isExpanded, setIsExpanded] = useState(false);
  const collapsedCount = 8;
  const visibleCategories = isExpanded ? categories : categories.slice(0, collapsedCount);
  const hasOverflow = categories.length > collapsedCount;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    onAddCategory(newCategoryName);
    setNewCategoryName('');
  };

  return (
    <section className="bg-white px-4 sm:px-6 py-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center gap-5 overflow-hidden">
      <div className="w-full md:w-auto flex items-center h-8">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.14em] whitespace-nowrap">Categories</h2>
      </div>
      <div className="w-full md:flex-1 min-w-0 flex flex-wrap items-center gap-4">
        <form onSubmit={handleAddCategory} className="w-full sm:w-auto flex items-center gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category..."
            className="flex-1 sm:flex-none px-4 h-10 border border-slate-200 bg-slate-50 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-800 min-w-0 sm:min-w-[180px] transition-all"
          />
          <button
            type="submit"
            className="bg-slate-800 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-900 transition-colors shadow-sm active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </form>

        <div className="h-6 w-px bg-slate-100 hidden md:block" />

        <div className="w-full min-w-0 space-y-2">
          <div
            className={`min-w-0 flex items-center gap-2.5 ${isExpanded ? 'flex-wrap overflow-hidden' : 'overflow-x-auto pb-1 pr-2 [scrollbar-width:thin]'}`}
          >
            {visibleCategories.map((category) => (
            <div
              key={category.id}
              className="group shrink-0 max-w-full flex items-center gap-2 px-3.5 min-h-10 py-1 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-600 shadow-sm hover:border-slate-300 transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${category.color}`} />
              <span className="max-w-[140px] sm:max-w-[180px] lg:max-w-[220px] truncate" title={category.name}>
                {category.name}
              </span>
              <button
                onClick={() => onDeleteCategory(category.id)}
                className="text-slate-400 hover:text-rose-500 transition-colors w-8 h-8 inline-flex items-center justify-center rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            ))}
          </div>

          {hasOverflow && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1 py-0.5"
            >
              {isExpanded ? 'Collapse categories' : `Show all (${categories.length})`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(CategoryToolbar);
