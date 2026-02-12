
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Category } from '../types';

interface SearchableSelectProps {
  categories: Category[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ 
  categories, 
  value, 
  onChange, 
  placeholder = "Select category...",
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedCategory = useMemo(() => 
    value === null ? null : categories.find(c => c.id === value),
    [categories, value]
  );

  // Including "Unallocated Pool" as a virtual option at the top of the search results
  const allOptions = useMemo(() => {
    const term = search.toLowerCase();
    const filtered = categories.filter(c => c.name.toLowerCase().includes(term));
    
    const options: (Category | null)[] = [];
    // Only show unallocated if it matches search or search is empty
    if (!search || "unallocated pool".includes(term)) {
      options.push(null);
    }
    return [...options, ...filtered];
  }, [categories, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset active index when list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [allOptions]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex, isOpen]);

  const handleFocus = () => {
    setIsOpen(true);
    setSearch("");
  };

  const handleSelect = (id: string | null) => {
    onChange(id);
    setIsOpen(false);
    setSearch("");
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % allOptions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + allOptions.length) % allOptions.length);
        break;
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        const selected = allOptions[activeIndex];
        handleSelect(selected ? selected.id : null);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        // Let tab work normally but close dropdown
        setIsOpen(false);
        break;
    }
  };

  const displayValue = isOpen ? search : (selectedCategory?.name || "");

  return (
    <div 
      className={`relative ${className} ${isOpen ? 'z-[110]' : 'z-auto'}`} 
      ref={containerRef}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={selectedCategory ? selectedCategory.name : placeholder}
          className={`
            w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer 
            text-sm font-medium outline-none transition-all
            focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
            ${!isOpen && selectedCategory ? 'text-slate-700' : 'text-slate-800'}
            ${!isOpen && !selectedCategory ? 'placeholder-slate-400' : 'placeholder-slate-300'}
            pr-8
          `}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[120] mt-1 w-full min-w-[180px] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div 
            ref={scrollContainerRef}
            className="max-h-[200px] overflow-y-auto custom-scrollbar"
          >
            {allOptions.map((opt, idx) => {
              const isSelected = value === (opt ? opt.id : null);
              const isActive = idx === activeIndex;
              
              if (opt === null) {
                return (
                  <div 
                    key="unallocated"
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(null); }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors border-b border-slate-50 
                      ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:bg-slate-50'}
                      ${isSelected ? 'bg-indigo-100/50' : ''}
                    `}
                  >
                    Unallocated Pool
                  </div>
                );
              }
              
              return (
                <div 
                  key={opt.id}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(opt.id); }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors 
                    ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}
                    ${isSelected ? 'bg-indigo-100/30' : ''}
                  `}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${opt.color}`}></span>
                  <span className="truncate">{opt.name}</span>
                </div>
              );
            })}
            
            {allOptions.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-slate-400 italic">No matches for &quot;{search}&quot;</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
