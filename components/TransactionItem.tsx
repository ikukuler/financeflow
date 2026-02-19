
import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Transaction, Category } from '../types';
import SearchableSelect from './SearchableSelect';

interface TransactionItemProps {
  dndId: string;
  transaction: Transaction;
  categories: Category[];
  onMove: (txId: string, categoryId: string | null, beforeTransactionId?: string | null, afterTransactionId?: string | null) => void;
  onUpdateName: (txId: string, name: string) => void;
  onUpdateAmount: (txId: string, amount: number) => void;
  onToggleSpent: (txId: string) => void;
  onRemove: (txId: string) => void;
  forceNameInput?: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  dndId,
  transaction, 
  categories, 
  onMove, 
  onUpdateName,
  onUpdateAmount,
  onToggleSpent,
  onRemove,
  forceNameInput = false,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [localName, setLocalName] = useState(transaction.name);
  const [localAmount, setLocalAmount] = useState(transaction.amount.toString());
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const [isDragHandleActive, setIsDragHandleActive] = useState(false);

  useEffect(() => {
    setLocalName(transaction.name);
    setLocalAmount(transaction.amount.toString());
  }, [transaction.name, transaction.amount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(pointer: coarse)');
    const syncTouchState = () => setIsTouchDevice(media.matches);

    syncTouchState();
    media.addEventListener('change', syncTouchState);
    return () => media.removeEventListener('change', syncTouchState);
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: dndId,
    disabled: isTouchDevice || isEditingAmount || isEditingName || isDropdownActive,
  });

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

  const amountCell = isEditingAmount ? (
    <input
      autoFocus
      type="text"
      inputMode="decimal"
      value={localAmount}
      onChange={(e) => setLocalAmount(e.target.value)}
      onBlur={handleAmountBlur}
      onKeyDown={handleAmountKeyDown}
      className="w-24 text-sm font-bold tabular-nums text-right bg-slate-50 border-b border-indigo-400 outline-none py-0.5 text-slate-700"
    />
  ) : (
    <button
      type="button"
      onClick={() => setIsEditingAmount(true)}
      className={`tabular-nums text-sm md:text-base font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded-md ${
        transaction.isSpent ? 'text-slate-400 line-through decoration-slate-400 decoration-2' : 'text-slate-800 hover:text-indigo-600'
      }`}
      title="Edit amount"
    >
      {transaction.amount.toLocaleString()}
      <small className={`ml-1 text-[11px] ${transaction.isSpent ? 'text-slate-300' : 'text-slate-400'}`}>MDL</small>
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      // Apply higher z-index when editing name or when the dropdown is active to prevent clipping
      className={`w-full border rounded-xl shadow-sm p-3 transition-all group relative
        ${transaction.isSpent ? 'bg-slate-100 border-slate-200 opacity-60 grayscale' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'}
        ${(isEditingName || isEditingAmount || isDropdownActive) ? 'z-[100] ring-2 ring-indigo-100' : 'z-auto'}
        ${isDragging ? 'scale-[1.02] shadow-xl ring-2 ring-indigo-200' : ''}
        cursor-default
      `}
    >
      <div className="flex items-start md:items-center gap-2">
        <div className="hidden md:flex shrink-0">
          <button
            type="button"
            aria-label="Drag transaction"
            title="Drag to move"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            onMouseDown={() => setIsDragHandleActive(true)}
            onMouseUp={() => setIsDragHandleActive(false)}
            onMouseLeave={() => setIsDragHandleActive(false)}
            className={`hidden md:inline-flex w-8 h-8 items-center justify-center rounded-md cursor-grab active:cursor-grabbing [touch-action:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isDragHandleActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" />
            </svg>
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 md:hidden mb-1">
            {amountCell}
            <div className="shrink-0 flex gap-1">
              <button 
                type="button"
                onClick={() => onToggleSpent(transaction.id)}
                title={transaction.isSpent ? "Mark as planned" : "Mark as spent"}
                className={`transition-colors w-10 h-10 inline-flex items-center justify-center rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${transaction.isSpent ? 'text-indigo-600 hover:text-indigo-800' : 'text-slate-400 hover:text-emerald-500'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button 
                type="button"
                onClick={() => onRemove(transaction.id)}
                className="text-slate-400 hover:text-rose-500 transition-colors w-10 h-10 inline-flex items-center justify-center rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-1.5">
            {isEditingName || forceNameInput ? (
              <input 
                autoFocus={isEditingName}
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full text-sm bg-slate-50 border-b border-indigo-400 outline-none py-0.5 font-medium text-slate-700"
                placeholder="Add comment..."
              />
            ) : (
              <p 
                onClick={() => setIsEditingName(true)}
                className={`text-sm font-medium line-clamp-1 min-h-[1.25rem] cursor-text transition-colors
                  ${transaction.isSpent ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700 hover:text-indigo-600'}
                `}
              >
                {transaction.name || <span className="text-slate-300 italic">Add name...</span>}
              </p>
            )}
          </div>
        </div>

        <div className="hidden md:flex w-28 justify-end shrink-0">{amountCell}</div>

        <div className="hidden md:flex shrink-0 gap-1 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setIsMoveMenuOpen((prev) => !prev)}
            title="Move to category"
            className={`hidden md:inline-flex transition-colors w-8 h-8 items-center justify-center rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${isMoveMenuOpen ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h11M8 7l3-3M8 7l3 3M16 17H5M16 17l-3-3M16 17l-3 3" />
            </svg>
          </button>
          <button 
            type="button"
            onClick={() => onToggleSpent(transaction.id)}
            title={transaction.isSpent ? "Mark as planned" : "Mark as spent"}
            className={`transition-colors w-10 h-10 md:w-8 md:h-8 inline-flex items-center justify-center rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${transaction.isSpent ? 'text-indigo-600 hover:text-indigo-800' : 'text-slate-400 hover:text-emerald-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button 
            type="button"
            onClick={() => onRemove(transaction.id)}
            className="text-slate-400 hover:text-rose-500 transition-colors w-10 h-10 md:w-8 md:h-8 inline-flex items-center justify-center rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="md:hidden" onFocus={() => setIsDropdownActive(true)} onBlur={() => setIsDropdownActive(false)}>
        <SearchableSelect
          categories={categories}
          value={transaction.categoryId}
          onChange={(val) => onMove(transaction.id, val)}
          placeholder="Pool"
          className="mt-1"
        />
      </div>

      {isMoveMenuOpen && (
        <div className="hidden md:block" onFocus={() => setIsDropdownActive(true)} onBlur={() => setIsDropdownActive(false)}>
          <SearchableSelect
            categories={categories}
            value={transaction.categoryId}
            onChange={(val) => {
              onMove(transaction.id, val);
              setIsMoveMenuOpen(false);
            }}
            placeholder="Move to..."
            className="mt-1"
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(TransactionItem);
