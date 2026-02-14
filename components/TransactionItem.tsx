
import React, { useState, useEffect } from 'react';
import { Transaction, Category } from '../types';
import SearchableSelect from './SearchableSelect';

interface TransactionItemProps {
  transaction: Transaction;
  categories: Category[];
  onMove: (txId: string, categoryId: string | null) => void;
  onUpdateName: (txId: string, name: string) => void;
  onUpdateAmount: (txId: string, amount: number) => void;
  onToggleSpent: (txId: string) => void;
  onRemove: (txId: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  categories, 
  onMove, 
  onUpdateName,
  onUpdateAmount,
  onToggleSpent,
  onRemove 
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [localName, setLocalName] = useState(transaction.name);
  const [localAmount, setLocalAmount] = useState(transaction.amount.toString());
  const [isDropdownActive, setIsDropdownActive] = useState(false);

  useEffect(() => {
    setLocalName(transaction.name);
    setLocalAmount(transaction.amount.toString());
  }, [transaction.name, transaction.amount]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('txId', transaction.id);
    const target = e.target as HTMLElement;
    target.style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  };

  const handleBlur = () => {
    setIsEditingName(false);
    onUpdateName(transaction.id, localName);
  };

  const handleAmountBlur = () => {
    const parsed = Number(localAmount.replace(',', '.'));

    setIsEditingAmount(false);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setLocalAmount(transaction.amount.toString());
      return;
    }

    if (parsed !== transaction.amount) {
      onUpdateAmount(transaction.id, parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAmountBlur();
    }
    if (e.key === 'Escape') {
      setIsEditingAmount(false);
      setLocalAmount(transaction.amount.toString());
    }
  };

  return (
    <div 
      draggable={!isEditingAmount && !isEditingName && !isDropdownActive}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      // Apply higher z-index when editing name or when the dropdown is active to prevent clipping
      className={`inline-flex flex-col border rounded-xl shadow-sm p-3 min-w-[140px] max-w-[200px] cursor-grab active:cursor-grabbing transition-all group relative
        ${transaction.isSpent ? 'bg-slate-100 border-slate-200 opacity-60 grayscale' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'}
        ${(isEditingName || isEditingAmount || isDropdownActive) ? 'z-[100] ring-2 ring-indigo-100' : 'z-auto'}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        {isEditingAmount ? (
          <input
            autoFocus
            type="text"
            inputMode="decimal"
            value={localAmount}
            onChange={(e) => setLocalAmount(e.target.value)}
            onBlur={handleAmountBlur}
            onKeyDown={handleAmountKeyDown}
            className="w-20 text-sm font-bold bg-slate-50 border-b border-indigo-400 outline-none py-0.5 text-slate-700"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingAmount(true)}
            className={`text-left text-lg font-bold transition-colors cursor-pointer ${transaction.isSpent ? 'text-slate-400 line-through decoration-slate-400 decoration-2' : 'text-slate-800 hover:text-indigo-600'}`}
            title="Edit amount"
          >
            {transaction.amount.toLocaleString()}
            <small className={`ml-1 text-[10px] ${transaction.isSpent ? 'text-slate-300' : 'text-slate-400'}`}>MDL</small>
          </button>
        )}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            type="button"
            onClick={() => onToggleSpent(transaction.id)}
            title={transaction.isSpent ? "Mark as planned" : "Mark as spent"}
            className={`transition-colors p-1 rounded cursor-pointer ${transaction.isSpent ? 'text-indigo-600 hover:text-indigo-800' : 'text-slate-300 hover:text-emerald-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button 
            type="button"
            onClick={() => onRemove(transaction.id)}
            className="text-slate-300 hover:text-rose-500 transition-colors p-1 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-2">
        {isEditingName ? (
          <input 
            autoFocus
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full text-xs bg-slate-50 border-b border-indigo-400 outline-none py-0.5 font-medium text-slate-700"
          />
        ) : (
          <p 
            onClick={() => setIsEditingName(true)}
            className={`text-xs font-medium line-clamp-2 min-h-[1.25rem] cursor-text transition-colors
              ${transaction.isSpent ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-600 hover:text-indigo-600'}
            `}
          >
            {transaction.name || <span className="text-slate-300 italic">Add name...</span>}
          </p>
        )}
      </div>
      
      <div onFocus={() => setIsDropdownActive(true)} onBlur={() => setIsDropdownActive(false)}>
        <SearchableSelect 
          categories={categories}
          value={transaction.categoryId}
          onChange={(val) => onMove(transaction.id, val)}
          placeholder="Pool"
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default TransactionItem;
