import React, { useState } from 'react';
import { Category, Transaction } from '../../types';
import TransactionItem from '../TransactionItem';

interface UnallocatedPoolProps {
  transactions: Transaction[];
  categories: Category[];
  onDropTransaction: (txId: string) => void;
  onMove: (txId: string, categoryId: string | null) => void;
  onUpdateName: (txId: string, name: string) => void;
  onUpdateAmount: (txId: string, amount: number) => void;
  onToggleSpent: (txId: string) => void;
  onRemove: (txId: string) => void;
}

const UnallocatedPool: React.FC<UnallocatedPoolProps> = ({
  transactions,
  categories,
  onDropTransaction,
  onMove,
  onUpdateName,
  onUpdateAmount,
  onToggleSpent,
  onRemove,
}) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-8 order-2 lg:order-1">
      <div
        className={`relative p-6 rounded-3xl border-2 border-dashed min-h-[400px] transition-all ${isOver ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-100' : 'bg-slate-100 border-slate-200'}`}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsOver(true)}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          setIsOver(false);
          const txId = e.dataTransfer.getData('txId');
          onDropTransaction(txId);
        }}
      >
        {isOver && (
          <div className="absolute inset-4 z-10 pointer-events-none flex items-center justify-center rounded-2xl border-2 border-dashed border-indigo-400 bg-indigo-100/70">
            <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-indigo-700 shadow-sm">
              Drop here to unassign
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Inbox / Unallocated</h2>
          <span className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-400 border border-slate-200">
            {transactions.length}
          </span>
        </div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
            <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No unallocated items</p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">New expenses land here before categorization.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {transactions.map((tx) => (
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
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default UnallocatedPool;
