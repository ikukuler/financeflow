import React, { useMemo } from 'react';
import { Category, Transaction } from '../../types';
import CategoryBlock from '../CategoryBlock';

interface CategoriesGridProps {
  categories: Category[];
  transactions: Transaction[];
  layoutMode: 'scroll' | 'wrap';
  onMove: (txId: string, categoryId: string | null, beforeTransactionId?: string | null, afterTransactionId?: string | null) => void;
  onUpdateName: (txId: string, name: string) => void;
  onUpdateAmount: (txId: string, amount: number) => void;
  onToggleSpent: (txId: string) => void;
  onMarkAllSpent: (categoryId: string) => void;
  onRemove: (txId: string) => void;
  onAddTransaction: (amount: number, categoryId: string | null, name: string) => void;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  transactions,
  layoutMode,
  onMove,
  onUpdateName,
  onUpdateAmount,
  onToggleSpent,
  onMarkAllSpent,
  onRemove,
  onAddTransaction,
}) => {
  const transactionsByCategory = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();
    transactions.forEach((tx) => {
      if (!tx.categoryId) return;
      const list = grouped.get(tx.categoryId) ?? [];
      list.push(tx);
      grouped.set(tx.categoryId, list);
    });
    return grouped;
  }, [transactions]);

  const isScrollMode = layoutMode === 'scroll';

  return (
    <main className="order-1">
      {isScrollMode ? (
        <div className="overflow-x-auto pb-2 [scrollbar-width:thin]">
          <div className="flex items-start gap-5 min-w-max pr-2">
            {categories.map((category) => (
              <div key={category.id} className="w-[360px] xl:w-[390px] shrink-0">
                <CategoryBlock
                  dndId={`col:${category.id}`}
                  category={category}
                  transactions={transactionsByCategory.get(category.id) ?? []}
                  onMove={onMove}
                  onUpdateName={onUpdateName}
                  onUpdateAmount={onUpdateAmount}
                  onToggleSpent={onToggleSpent}
                  onMarkAllSpent={onMarkAllSpent}
                  categories={categories}
                  onRemove={onRemove}
                  onAdd={onAddTransaction}
                />
              </div>
            ))}

            {categories.length === 0 && (
              <div className="w-full min-w-[320px] py-32 text-center border-2 border-dashed rounded-[2rem] border-slate-200 bg-white">
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em]">No categories yet</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
          {categories.map((category) => (
            <CategoryBlock
              key={category.id}
              dndId={`col:${category.id}`}
              category={category}
              transactions={transactionsByCategory.get(category.id) ?? []}
              onMove={onMove}
              onUpdateName={onUpdateName}
              onUpdateAmount={onUpdateAmount}
              onToggleSpent={onToggleSpent}
              onMarkAllSpent={onMarkAllSpent}
              categories={categories}
              onRemove={onRemove}
              onAdd={onAddTransaction}
            />
          ))}

          {categories.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed rounded-[2rem] border-slate-200 bg-white">
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em]">No categories yet</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default React.memo(CategoriesGrid);
