'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import AuthScreen from './AuthScreen';
import InitialBalanceModal from './InitialBalanceModal';
import AddExpenseModal from './modals/AddExpenseModal';
import AppHeader from './sections/AppHeader';
import CategoriesGrid from './sections/CategoriesGrid';
import CategoryToolbar from './sections/CategoryToolbar';
import UnallocatedPool from './sections/UnallocatedPool';
import { useBudgetPlanner } from '../hooks/useBudgetPlanner';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { DEMO_CLEANUP_MINUTES, isDemoUserEmail } from '@/lib/demo-config';

const PlannerSkeleton: React.FC = () => (
  <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="h-8 w-56 rounded bg-slate-200" />
      <div className="mt-3 h-4 w-40 rounded bg-slate-100" />
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-14 rounded-xl bg-slate-100" />
        <div className="h-14 rounded-xl bg-slate-100" />
        <div className="h-14 rounded-xl bg-slate-100" />
        <div className="h-14 rounded-xl bg-slate-100" />
      </div>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="h-6 w-32 rounded bg-slate-200" />
      <div className="mt-4 h-8 w-64 rounded-full bg-slate-100" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-slate-100 h-[380px]" />
      <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white h-[280px]" />
        <div className="rounded-3xl border border-slate-200 bg-white h-[280px]" />
      </div>
    </div>
  </div>
);

const DEMO_CLEANUP_AT_STORAGE_KEY = 'financeflow:demo_cleanup_at';

interface PendingDeleteAction {
  type: 'transaction' | 'category';
  id: string;
  label: string;
}

const PlannerApp: React.FC = () => {
  const [isInitialBalanceModalOpen, setIsInitialBalanceModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteAction | null>(null);
  const lastErrorToastRef = useRef<string | null>(null);

  const {
    user,
    isLoading: isAuthLoading,
    error: authError,
    info: authInfo,
    signIn,
    signUp,
    signOut,
    getAccessToken,
    clearError: clearAuthError,
    clearInfo: clearAuthInfo,
  } = useSupabaseAuth();

  const {
    planId,
    categories,
    transactions,
    initialBalance,
    saveInitialBalance,
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
    clearError,
    reloadPlannerData,
  } = useBudgetPlanner({ enabled: !!user });

  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const isDemoUser = isDemoUserEmail(user?.email);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!error) {
      lastErrorToastRef.current = null;
      return;
    }

    if (lastErrorToastRef.current === error) return;
    lastErrorToastRef.current = error;
    toast.error(error);
  }, [error]);

  const handleSaveInitialBalance = useCallback(
    (value: number) => {
      void (async () => {
        const success = await saveInitialBalance(value);
        if (!success) return;

        toast.success('Initial balance updated.');
        setIsInitialBalanceModalOpen(false);
      })();
    },
    [saveInitialBalance],
  );

  const handleAddTransaction = useCallback(
    (amount: number, categoryId: string | null, name: string) => {
      void (async () => {
        const success = await addTransaction(amount, categoryId, name);
        if (!success) return;

        toast.success('Transaction added.');
        setIsAddExpenseModalOpen(false);
      })();
    },
    [addTransaction],
  );

  const handleAddCategory = useCallback(
    (name: string) => {
      void (async () => {
        const success = await addCategory(name);
        if (!success) return;
        toast.success('Category added.');
      })();
    },
    [addCategory],
  );

  const handleMoveTransaction = useCallback(
    (txId: string, categoryId: string | null) => {
      void (async () => {
        const success = await moveTransaction(txId, categoryId);
        if (!success) return;
        toast.success('Transaction updated.');
      })();
    },
    [moveTransaction],
  );

  const handleUpdateTransactionName = useCallback(
    (txId: string, name: string) => {
      void (async () => {
        const success = await updateTransactionName(txId, name);
        if (!success) return;
        toast.success('Transaction updated.');
      })();
    },
    [updateTransactionName],
  );

  const handleUpdateTransactionAmount = useCallback(
    (txId: string, amount: number) => {
      void (async () => {
        const success = await updateTransactionAmount(txId, amount);
        if (!success) return;
        toast.success('Transaction updated.');
      })();
    },
    [updateTransactionAmount],
  );

  const handleToggleTransactionSpent = useCallback(
    (txId: string) => {
      const tx = transactions.find((item) => item.id === txId);
      if (!tx) return;

      void (async () => {
        const success = await toggleTransactionSpent(txId);
        if (!success) return;
        toast.success(tx.isSpent ? 'Transaction marked as planned.' : 'Transaction marked as spent.');
      })();
    },
    [toggleTransactionSpent, transactions],
  );

  const handleMarkCategorySpent = useCallback(
    (categoryId: string) => {
      const unspentCount = transactions.filter((tx) => tx.categoryId === categoryId && !tx.isSpent).length;
      if (unspentCount === 0) return;

      void (async () => {
        const success = await markCategorySpent(categoryId);
        if (!success) return;
        toast.success('Category transactions updated.');
      })();
    },
    [markCategorySpent, transactions],
  );

  const requestDeleteTransaction = useCallback(
    (txId: string) => {
      const tx = transactions.find((item) => item.id === txId);
      if (!tx) return;

      setPendingDelete({
        type: 'transaction',
        id: txId,
        label: tx.name.trim() || `${tx.amount.toLocaleString()} MDL`,
      });
    },
    [transactions],
  );

  const requestDeleteCategory = useCallback(
    (categoryId: string) => {
      const category = categories.find((item) => item.id === categoryId);
      if (!category) return;

      setPendingDelete({
        type: 'category',
        id: categoryId,
        label: category.name,
      });
    },
    [categories],
  );

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return;

    const action = pendingDelete;
    setPendingDelete(null);

    void (async () => {
      if (action.type === 'transaction') {
        const success = await removeTransaction(action.id);
        if (!success) return;
        toast.success('Transaction deleted.');
        return;
      }

      const success = await deleteCategory(action.id);
      if (!success) return;
      toast.success('Category deleted.');
    })();
  }, [deleteCategory, pendingDelete, removeTransaction]);

  useEffect(() => {
    if (!isDemoUser || !hasInitialLoadCompleted) {
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (!isDemoUser) localStorage.removeItem(DEMO_CLEANUP_AT_STORAGE_KEY);
      setTimeRemaining(null);
      return;
    }

    const ttlMs = DEMO_CLEANUP_MINUTES * 60 * 1000;

    const updateCountdown = (cleanupAt: number) => {
      const remaining = Math.max(0, Math.floor((cleanupAt - Date.now()) / 1000));
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      setTimeRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
    };

    const scheduleCleanup = (delayMs: number, cleanupAt: number) => {
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      updateCountdown(cleanupAt);
      countdownIntervalRef.current = setInterval(() => updateCountdown(cleanupAt), 1000);

      cleanupTimerRef.current = setTimeout(() => {
        void runCleanup();
      }, delayMs);
    };

    const runCleanup = async () => {
      if (!planId) return;

      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error('No active access token');
        }

        const response = await fetch('/api/demo/cleanup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ keepPlanId: planId }),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Cleanup failed with status ${response.status}`);
        }

        await reloadPlannerData();
        toast.success('Demo data was reset successfully.');
      } catch (err) {
        console.error('Demo cleanup failed:', err);
        toast.error(err instanceof Error ? err.message : 'Demo cleanup failed');
      } finally {
        const nextCleanupAt = Date.now() + ttlMs;
        localStorage.setItem(DEMO_CLEANUP_AT_STORAGE_KEY, String(nextCleanupAt));
        scheduleCleanup(ttlMs, nextCleanupAt);
      }
    };

    const storedValue = localStorage.getItem(DEMO_CLEANUP_AT_STORAGE_KEY);
    const parsedCleanupAt = storedValue ? Number(storedValue) : NaN;
    const now = Date.now();
    const cleanupAt = Number.isFinite(parsedCleanupAt) ? parsedCleanupAt : now + ttlMs;

    if (!Number.isFinite(parsedCleanupAt)) {
      localStorage.setItem(DEMO_CLEANUP_AT_STORAGE_KEY, String(cleanupAt));
    }

    if (cleanupAt <= now) {
      void runCleanup();
    } else {
      scheduleCleanup(cleanupAt - now, cleanupAt);
    }

    return () => {
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [getAccessToken, hasInitialLoadCompleted, isDemoUser, planId, reloadPlannerData]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">Loading session...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        isLoading={false}
        error={authError}
        info={authInfo}
        onSignIn={signIn}
        onSignUp={signUp}
        onClearError={clearAuthError}
        onClearInfo={clearAuthInfo}
      />
    );
  }

  if (isLoading && !hasInitialLoadCompleted) {
    return <PlannerSkeleton />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <Toaster position="top-right" richColors closeButton />

      {isDemoUser && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>
              <strong>Demo Session:</strong> Data is automatically cleared for privacy.
            </span>
          </div>
          <div className="font-mono font-bold bg-amber-200/50 px-2 py-0.5 rounded text-amber-900">
            Reset in: {timeRemaining ?? '--:--'}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="shrink-0 rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold hover:bg-rose-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">Loading planner data...</div>
      )}

      <AppHeader
        initialBalance={initialBalance}
        totalSpent={totalSpent}
        totalAllocated={totalAllocated}
        remainingBalance={remainingBalance}
        onOpenInitialBalanceModal={() => setIsInitialBalanceModalOpen(true)}
        userEmail={user.email ?? null}
        onSignOut={() => {
          void signOut();
        }}
      />

      <CategoryToolbar categories={categories} onAddCategory={handleAddCategory} onDeleteCategory={requestDeleteCategory} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <UnallocatedPool
          transactions={uncategorizedTransactions}
          categories={categories}
          onDropTransaction={(txId) => handleMoveTransaction(txId, null)}
          onMove={handleMoveTransaction}
          onUpdateName={handleUpdateTransactionName}
          onUpdateAmount={handleUpdateTransactionAmount}
          onToggleSpent={handleToggleTransactionSpent}
          onRemove={requestDeleteTransaction}
        />

        <CategoriesGrid
          categories={categories}
          transactions={transactions}
          onMove={handleMoveTransaction}
          onUpdateName={handleUpdateTransactionName}
          onUpdateAmount={handleUpdateTransactionAmount}
          onToggleSpent={handleToggleTransactionSpent}
          onMarkAllSpent={handleMarkCategorySpent}
          onRemove={requestDeleteTransaction}
          onAddTransaction={handleAddTransaction}
        />
      </div>

      <button
        onClick={() => setIsAddExpenseModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-400 hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all z-40 group cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
        <span className="absolute right-20 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">
          Add Expense
        </span>
      </button>

      <InitialBalanceModal
        isOpen={isInitialBalanceModalOpen}
        onClose={() => setIsInitialBalanceModalOpen(false)}
        onSave={handleSaveInitialBalance}
        currentBalance={initialBalance}
      />

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        categories={categories}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onAdd={handleAddTransaction}
      />

      {pendingDelete && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer" onClick={() => setPendingDelete(null)} />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-800">Confirm deletion</h3>
            <p className="mt-2 text-sm text-slate-600">
              Delete {pendingDelete.type === 'transaction' ? 'transaction' : 'category'} &quot;{pendingDelete.label}&quot;?
            </p>
            <p className="mt-1 text-xs text-slate-400">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerApp;
