import React from 'react';
import { DndContext, DragOverlay, closestCenter, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import type { Category, Transaction } from '@/types';
import CategoriesGrid from '@/components/sections/CategoriesGrid';
import UnallocatedPool from '@/components/sections/UnallocatedPool';

interface BoardViewProps {
  categories: Category[];
  transactions: Transaction[];
  uncategorizedTransactions: Transaction[];
  layoutMode: 'scroll' | 'wrap';
  activeDragTx: Transaction | null;
  colDndId: (categoryId: string | null) => string;
  sensors: Parameters<typeof DndContext>[0]['sensors'];
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onLayoutChange: (layout: 'scroll' | 'wrap') => void;
  onMove: (txId: string, categoryId: string | null, beforeTransactionId?: string | null, afterTransactionId?: string | null) => void;
  onUpdateName: (txId: string, name: string) => void;
  onUpdateAmount: (txId: string, amount: number) => void;
  onToggleSpent: (txId: string) => void;
  onMarkAllSpent: (categoryId: string) => void;
  onRemove: (txId: string) => void;
  onAddTransaction: (amount: number, categoryId: string | null, name: string) => void;
}

export default function BoardView({
  categories,
  transactions,
  uncategorizedTransactions,
  layoutMode,
  activeDragTx,
  colDndId,
  sensors,
  onDragStart,
  onDragEnd,
  onLayoutChange,
  onMove,
  onUpdateName,
  onUpdateAmount,
  onToggleSpent,
  onMarkAllSpent,
  onRemove,
  onAddTransaction,
}: BoardViewProps) {
  return (
    <>
      <div className="flex justify-end">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onLayoutChange('scroll')}
            className={`h-9 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              layoutMode === 'scroll' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Scroll
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange('wrap')}
            className={`h-9 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              layoutMode === 'wrap' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Wrap
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        autoScroll={false}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-5 items-start">
          <UnallocatedPool
            dndId={colDndId(null)}
            transactions={uncategorizedTransactions}
            categories={categories}
            onMove={onMove}
            onUpdateName={onUpdateName}
            onUpdateAmount={onUpdateAmount}
            onToggleSpent={onToggleSpent}
            onRemove={onRemove}
          />

          <CategoriesGrid
            categories={categories}
            transactions={transactions}
            layoutMode={layoutMode}
            onMove={onMove}
            onUpdateName={onUpdateName}
            onUpdateAmount={onUpdateAmount}
            onToggleSpent={onToggleSpent}
            onMarkAllSpent={onMarkAllSpent}
            onRemove={onRemove}
            onAddTransaction={onAddTransaction}
          />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragTx ? (
            <div className="rounded-xl border border-indigo-200 bg-white px-3 py-2 shadow-2xl min-w-[220px]">
              <p className="text-sm font-semibold text-slate-700 truncate">{activeDragTx.name || 'Untitled'}</p>
              <p className="text-xs font-bold text-indigo-600 tabular-nums mt-0.5">
                {activeDragTx.amount.toLocaleString()} MDL
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
