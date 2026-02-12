import React, { useMemo } from 'react';
import { Category, Transaction } from '../../types';
import CategoryBlock from '../CategoryBlock';

interface CategoriesGridProps {
  categories: Category[];
  transactions: Transaction[];
  onMove: (txId: string, categoryId: string | null) => void;
  onUpdateName: (txId: string, name: string) => void;
  onToggleSpent: (txId: string) => void;
  onMarkAllSpent: (categoryId: string) => void;
  onRemove: (txId: string) => void;
  onAddTransaction: (amount: number, categoryId: string | null, name: string) => void;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  transactions,
  onMove,
  onUpdateName,
  onToggleSpent,
  onMarkAllSpent,
  onRemove,
  onAddTransaction,
}) => {
  const transactionsByCategory = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();

    transactions.forEach((tx) => {
      if (!tx.categoryId) return;

      const existing = grouped.get(tx.categoryId) ?? [];
      existing.push(tx);
      grouped.set(tx.categoryId, existing);
    });

    return grouped;
  }, [transactions]);

  return (
    <main className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6 order-1 lg:order-2">
      {categories.map((category) => (
        <CategoryBlock
          key={category.id}
          category={category}
          transactions={transactionsByCategory.get(category.id) ?? []}
          onMove={onMove}
          onUpdateName={onUpdateName}
          onToggleSpent={onToggleSpent}
          onMarkAllSpent={onMarkAllSpent}
          categories={categories}
          onRemove={onRemove}
          onAdd={onAddTransaction}
        />
      ))}

      {categories.length === 0 && (
        <div className="col-span-full py-32 text-center border-2 border-dashed rounded-[3rem] border-slate-200 bg-white">
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em]">No categories yet</p>
        </div>
      )}
    </main>
  );
};

export default CategoriesGrid;
