import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserPlannerRepository } from '@/lib/supabase';
import type { PlannerRepository } from '@/lib/planner/repository';
import type { Category, Transaction } from '../types';

const CATEGORY_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-pink-500',
];

const randomCategoryColor = () => CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];

interface UseBudgetPlannerOptions {
  enabled?: boolean;
}

const resolveRepository = (): { repository: PlannerRepository | null; initError: string | null } => {
  try {
    return { repository: createBrowserPlannerRepository(), initError: null };
  } catch (err) {
    return {
      repository: null,
      initError: err instanceof Error ? err.message : 'Failed to initialize planner repository',
    };
  }
};

export const useBudgetPlanner = ({ enabled = true }: UseBudgetPlannerOptions = {}) => {
  const [{ repository, initError }] = useState(resolveRepository);

  const [planId, setPlanId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [initialBalance, setInitialBalanceState] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [hasInitialLoadCompleted, setHasInitialLoadCompleted] = useState(false);
  const [error, setError] = useState<string | null>(initError);

  const resetState = useCallback(() => {
    setPlanId(null);
    setCategories([]);
    setTransactions([]);
    setInitialBalanceState(0);
    setHasInitialLoadCompleted(false);
    setError(initError);
    setIsLoading(false);
  }, [initError]);

  const reloadSnapshot = useCallback(
    async (targetPlanId: string) => {
      if (!repository) return;
      const snapshot = await repository.getSnapshot(targetPlanId);
      setCategories(snapshot.categories);
      setTransactions(snapshot.transactions);
      setInitialBalanceState(snapshot.initialBalance);
    },
    [repository],
  );

  useEffect(() => {
    let disposed = false;

    if (!enabled) {
      resetState();
      return () => {
        disposed = true;
      };
    }

    if (!repository) {
      setError(initError ?? 'Planner repository is unavailable');
      setIsLoading(false);
      setHasInitialLoadCompleted(true);
      return () => {
        disposed = true;
      };
    }

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const plan = await repository.getOrCreateDefaultPlan();
        if (disposed) return;

        setPlanId(plan.id);
        await reloadSnapshot(plan.id);
      } catch (err) {
        if (disposed) return;
        setError(err instanceof Error ? err.message : 'Failed to load planner data');
      } finally {
        if (!disposed) {
          setIsLoading(false);
          setHasInitialLoadCompleted(true);
        }
      }
    };

    void load();

    return () => {
      disposed = true;
    };
  }, [enabled, repository, initError, reloadSnapshot, resetState]);

  const requirePlanId = useCallback((): string => {
    if (!planId) {
      throw new Error('Planner is not initialized yet');
    }

    return planId;
  }, [planId]);

  const saveInitialBalance = useCallback(
    async (value: number) => {
      if (!enabled || !repository) return false;

      const targetPlanId = requirePlanId();
      const prev = initialBalance;

      setInitialBalanceState(value);

      try {
        setError(null);
        await repository.updateInitialBalance(targetPlanId, value);
        return true;
      } catch (err) {
        setInitialBalanceState(prev);
        setError(err instanceof Error ? err.message : 'Failed to update initial balance');
        return false;
      }
    },
    [enabled, repository, initialBalance, requirePlanId],
  );

  const cleanupDemoData = useCallback(async () => {
    if (!repository || !planId) return false;

    try {
      setError(null);
      await repository.cleanupDemoData(planId);
      await reloadSnapshot(planId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cleanup demo data');
      return false;
    }
  }, [repository, planId, reloadSnapshot]);

  const reloadPlannerData = useCallback(async () => {
    if (!repository || !planId) return;

    try {
      setError(null);
      await reloadSnapshot(planId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reload planner data');
    }
  }, [repository, planId, reloadSnapshot]);

  const addTransaction = useCallback(
    async (amount: number, categoryId: string | null, name = '') => {
      if (!enabled || !repository) return false;

      const targetPlanId = requirePlanId();

      try {
        setError(null);
        const created = await repository.createTransaction({
          planId: targetPlanId,
          amount,
          categoryId,
          name,
          isSpent: false,
        });

        setTransactions((prev) => [...prev, created]);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add transaction');
        return false;
      }
    },
    [enabled, repository, requirePlanId],
  );

  const updateTransaction = useCallback(
    async (
      txId: string,
      patch: {
        categoryId?: string | null;
        name?: string;
        amount?: number;
        isSpent?: boolean;
        spentAt?: string | null;
      },
    ) => {
      if (!enabled || !repository) return false;

      const currentPlanId = requirePlanId();

      try {
        setError(null);
        const updated = await repository.updateTransaction(txId, patch);
        setTransactions((prev) => prev.map((tx) => (tx.id === txId ? updated : tx)));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update transaction');
        await reloadSnapshot(currentPlanId);
        return false;
      }
    },
    [enabled, repository, reloadSnapshot, requirePlanId],
  );

  const moveTransaction = useCallback(
    async (txId: string, categoryId: string | null) => {
      return updateTransaction(txId, { categoryId });
    },
    [updateTransaction],
  );

  const updateTransactionName = useCallback(
    async (txId: string, name: string) => {
      return updateTransaction(txId, { name });
    },
    [updateTransaction],
  );

  const updateTransactionAmount = useCallback(
    async (txId: string, amount: number) => {
      return updateTransaction(txId, { amount });
    },
    [updateTransaction],
  );

  const toggleTransactionSpent = useCallback(
    async (txId: string) => {
      const tx = transactions.find((item) => item.id === txId);
      if (!tx) return false;

      return updateTransaction(txId, {
        isSpent: !tx.isSpent,
        spentAt: !tx.isSpent ? new Date().toISOString() : null,
      });
    },
    [transactions, updateTransaction],
  );

  const markCategorySpent = useCallback(
    async (categoryId: string) => {
      const target = transactions.filter((tx) => tx.categoryId === categoryId && !tx.isSpent);
      if (target.length === 0) return true;

      for (const tx of target) {
        const success = await updateTransaction(tx.id, { isSpent: true, spentAt: new Date().toISOString() });
        if (!success) return false;
      }

      return true;
    },
    [transactions, updateTransaction],
  );

  const removeTransaction = useCallback(
    async (txId: string) => {
      if (!repository) return false;

      const prev = transactions;
      setTransactions((current) => current.filter((tx) => tx.id !== txId));

      try {
        setError(null);
        await repository.deleteTransaction(txId);
        return true;
      } catch (err) {
        setTransactions(prev);
        setError(err instanceof Error ? err.message : 'Failed to delete transaction');
        return false;
      }
    },
    [repository, transactions],
  );

  const addCategory = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName || !enabled || !repository) return false;

      const targetPlanId = requirePlanId();

      try {
        setError(null);
        const created = await repository.createCategory({
          planId: targetPlanId,
          name: trimmedName,
          color: randomCategoryColor(),
          sortOrder: categories.length,
        });

        setCategories((prev) => [...prev, created]);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create category');
        return false;
      }
    },
    [categories.length, enabled, repository, requirePlanId],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      if (!repository) return false;

      const prevCategories = categories;
      const prevTransactions = transactions;

      setCategories((prev) => prev.filter((category) => category.id !== id));
      setTransactions((prev) => prev.map((tx) => (tx.categoryId === id ? { ...tx, categoryId: null } : tx)));

      try {
        setError(null);
        await repository.deleteCategory(id);
        return true;
      } catch (err) {
        setCategories(prevCategories);
        setTransactions(prevTransactions);
        setError(err instanceof Error ? err.message : 'Failed to delete category');
        return false;
      }
    },
    [repository, categories, transactions],
  );

  const uncategorizedTransactions = useMemo(
    () => transactions.filter((tx) => tx.categoryId === null),
    [transactions],
  );

  const totalAllocated = useMemo(() => transactions.reduce((acc, tx) => acc + tx.amount, 0), [transactions]);

  const totalSpent = useMemo(
    () => transactions.reduce((acc, tx) => (tx.isSpent ? acc + tx.amount : acc), 0),
    [transactions],
  );

  const remainingBalance = initialBalance - totalAllocated;

  return {
    planId,
    categories,
    transactions,
    initialBalance,
    saveInitialBalance,
    cleanupDemoData,
    addTransaction,
    moveTransaction,
    updateTransactionName,
    updateTransactionAmount,
    toggleTransactionSpent,
    markCategorySpent,
    removeTransaction,
    addCategory,
    deleteCategory,
    uncategorizedTransactions,
    totalAllocated,
    totalSpent,
    remainingBalance,
    isLoading,
    hasInitialLoadCompleted,
    error,
    clearError: () => setError(null),
    reloadPlannerData,
  };
};
