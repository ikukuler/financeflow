
import React, { useState, useMemo, useRef } from 'react';
import { Category, Transaction } from '../types';
import TransactionItem from './TransactionItem';

interface CategoryBlockProps {
  category: Category;
  transactions: Transaction[];
  categories: Category[];
  onMove: (txId: string, categoryId: string | null) => void;
  onUpdateName: (txId: string, name: string) => void;
  onUpdateAmount: (txId: string, amount: number) => void;
  onToggleSpent: (txId: string) => void;
  onMarkAllSpent: (categoryId: string) => void;
  onRemove: (txId: string) => void;
  onAdd: (amount: number, categoryId: string | null, name: string) => void;
}

const RATES = {
  USD: 17,
  EUR: 20,
};

const CategoryBlock: React.FC<CategoryBlockProps> = ({ 
  category, 
  transactions, 
  categories, 
  onMove, 
  onUpdateName,
  onUpdateAmount,
  onToggleSpent,
  onMarkAllSpent,
  onRemove,
  onAdd
}) => {
  const [isOver, setIsOver] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addValue, setAddValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const total = useMemo(() => 
    transactions.reduce((acc, tx) => acc + tx.amount, 0),
    [transactions]
  );

  const spentTotal = useMemo(() => 
    transactions.reduce((acc, tx) => tx.isSpent ? acc + tx.amount : acc, 0),
    [transactions]
  );

  const remainingToSpend = useMemo(() => 
    total - spentTotal,
    [total, spentTotal]
  );

  const hasUnspent = useMemo(() => 
    transactions.some(tx => !tx.isSpent),
    [transactions]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const txId = e.dataTransfer.getData('txId');
    if (txId) {
      onMove(txId, category.id);
    }
  };

  const parseToMDL = (text: string): number | null => {
    const raw = text.toLowerCase().trim();
    if (!raw) return null;
    const isUSD = /\$|usd|доллар|долл|дол/.test(raw);
    const isEUR = /€|eur|euro|евро|евр/.test(raw);
    const numPart = raw.replace(/[^\d.,]/g, '').replace(',', '.');
    const value = parseFloat(numPart);
    if (isNaN(value)) return null;
    if (isUSD) return value * RATES.USD;
    if (isEUR) return value * RATES.EUR;
    return value;
  };

  const handleInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addValue.trim()) return;

    const lines = addValue.split('\n');
    let addedAny = false;

    lines.forEach(line => {
      const amount = parseToMDL(line);
      if (amount && amount > 0) {
        onAdd(amount, category.id, '');
        addedAny = true;
      }
    });

    if (addedAny) {
      setAddValue('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsAdding(false);
      setAddValue('');
    }
    // Allow Cmd/Ctrl + Enter to submit multiple lines
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleInlineAdd(e);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative rounded-3xl p-5 sm:p-6 min-h-[300px] transition-all duration-300 border
        ${isOver ? 'scale-[1.02] ring-4 ring-indigo-200 shadow-xl' : 'shadow-sm'}
        ${isOver ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200'}
      `}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[calc(1.5rem-2px)]">
        <div className={`absolute bottom-0 right-0 w-32 h-32 opacity-[0.03] transform translate-x-8 translate-y-8`}>
          <div className={`w-full h-full rounded-full ${category.color}`}></div>
        </div>
      </div>

      {isOver && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center rounded-[calc(1.5rem-1px)] border-2 border-dashed border-indigo-400 bg-indigo-100/50">
          <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-indigo-700 shadow-sm">
            Drop here to move
          </span>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
              <h3 className="text-xl font-bold text-slate-800">{category.name}</h3>
              <div className="flex items-center gap-1 ml-2">
                <button 
                  onClick={() => setIsAdding(true)}
                  className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white rounded-full transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  title="Add expenses to this category"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                {hasUnspent && (
                  <button 
                    onClick={() => onMarkAllSpent(category.id)}
                    className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-emerald-600 hover:text-white rounded-full transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    title="Mark all as spent"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">Category Budget</p>
          </div>
          <div className="text-right">
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-slate-800 tabular-nums">
                {total.toLocaleString()} <small className="text-xs text-slate-400">MDL</small>
              </span>
              
              <div className="flex flex-col items-end gap-1 mt-1">
                {spentTotal > 0 && (
                  <div className="flex items-center gap-1 text-slate-500">
                    <span className="text-[11px] font-semibold uppercase tracking-tight">Spent:</span>
                    <span className="text-sm font-bold line-through decoration-slate-400 decoration-2 tabular-nums">
                      {spentTotal.toLocaleString()} <small className="text-[11px]">MDL</small>
                    </span>
                  </div>
                )}
                
                {total > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-tight text-slate-500">Left:</span>
                    <span className={`text-sm font-bold tabular-nums ${remainingToSpend > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>
                      {remainingToSpend.toLocaleString()} <small className="text-[11px]">MDL</small>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isAdding && (
          <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleInlineAdd}>
              <textarea 
                ref={textareaRef}
                autoFocus
                rows={3}
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="100&#10;50$&#10;20 euro"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-indigo-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-mono text-sm shadow-inner resize-none"
              />
              <div className="mt-2 flex justify-between items-center">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-tight">
                  Ctrl+Enter to save
                </span>
                <div className="flex gap-3">
                   <button 
                    type="button"
                    onClick={() => { setIsAdding(false); setAddValue(''); }}
                    className="text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                   >
                     Cancel
                   </button>
                   <button 
                    type="submit"
                    className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                   >
                     Add All
                   </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-2">
          {transactions.length > 0 && (
            <div className="hidden lg:grid grid-cols-[1fr_112px_128px] gap-3 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Expense</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Actions</span>
            </div>
          )}
          {transactions.length === 0 && !isAdding ? (
            <div className="w-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
               <svg className="w-8 h-8 text-slate-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
               <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Drop amounts here</p>
               <button
                 type="button"
                 onClick={() => setIsAdding(true)}
                 className="mt-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:border-indigo-300 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
               >
                 Add expense
               </button>
            </div>
          ) : (
            transactions.map(tx => (
              <TransactionItem 
                key={tx.id} 
                transaction={tx} 
                categories={categories}
                onMove={onMove}
                onUpdateName={onUpdateName}
                onUpdateAmount={onUpdateAmount}
                onToggleSpent={onToggleSpent}
                onRemove={onRemove}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryBlock;
