'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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

const PlannerApp: React.FC = () => {
  const [isInitialBalanceModalOpen, setIsInitialBalanceModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  const {
    user,
    isLoading: isAuthLoading,
    error: authError,
    info: authInfo,
    signIn,
    signUp,
    signOut,
    clearError: clearAuthError,
    clearInfo: clearAuthInfo,
  } = useSupabaseAuth();

  const {
    categories,
    transactions,
    initialBalance,
    saveInitialBalance,
    cleanupDemoData,
    addTransaction,
    moveTransaction,
    updateTransactionName,
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
  } = useBudgetPlanner({ enabled: !!user });

  const isDemoUser = isDemoUserEmail(user?.email);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAddTransaction = useCallback(
    (amount: number, categoryId: string | null, name: string) => {
      void addTransaction(amount, categoryId, name);
      setIsAddExpenseModalOpen(false);
    },
    [addTransaction],
  );

  useEffect(() => {
    if (!isDemoUser || !hasInitialLoadCompleted) {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
      }
      if (!isDemoUser) {
        localStorage.removeItem(DEMO_CLEANUP_AT_STORAGE_KEY);
      }
      return;
    }

    const ttlMs = DEMO_CLEANUP_MINUTES * 60 * 1000;

    const scheduleCleanup = (delayMs: number) => {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }

      cleanupTimerRef.current = setTimeout(() => {
        void runCleanup();
      }, delayMs);
    };

    const runCleanup = async () => {
      await cleanupDemoData();

      const nextCleanupAt = Date.now() + ttlMs;
      localStorage.setItem(DEMO_CLEANUP_AT_STORAGE_KEY, String(nextCleanupAt));
      scheduleCleanup(ttlMs);
    };

    const now = Date.now();
    const storedValue = localStorage.getItem(DEMO_CLEANUP_AT_STORAGE_KEY);
    const parsedCleanupAt = storedValue ? Number(storedValue) : NaN;

    const cleanupAt = Number.isFinite(parsedCleanupAt) ? parsedCleanupAt : now + ttlMs;

    if (!Number.isFinite(parsedCleanupAt)) {
      localStorage.setItem(DEMO_CLEANUP_AT_STORAGE_KEY, String(cleanupAt));
    }

    if (cleanupAt <= now) {
      void runCleanup();
    } else {
      scheduleCleanup(cleanupAt - now);
    }

    return () => {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
      }
    };
  }, [cleanupDemoData, hasInitialLoadCompleted, isDemoUser]);

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
      {isDemoUser && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Demo mode: your categories, transactions and extra plans will be cleared automatically after {DEMO_CLEANUP_MINUTES}{' '}
          minutes.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="shrink-0 rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold hover:bg-rose-100"
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

      <CategoryToolbar categories={categories} onAddCategory={addCategory} onDeleteCategory={deleteCategory} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <UnallocatedPool
          transactions={uncategorizedTransactions}
          categories={categories}
          onDropTransaction={(txId) => {
            void moveTransaction(txId, null);
          }}
          onMove={moveTransaction}
          onUpdateName={updateTransactionName}
          onToggleSpent={toggleTransactionSpent}
          onRemove={removeTransaction}
        />

        <CategoriesGrid
          categories={categories}
          transactions={transactions}
          onMove={moveTransaction}
          onUpdateName={updateTransactionName}
          onToggleSpent={toggleTransactionSpent}
          onMarkAllSpent={markCategorySpent}
          onRemove={removeTransaction}
          onAddTransaction={handleAddTransaction}
        />
      </div>

      <button
        onClick={() => setIsAddExpenseModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-400 hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all z-40 group"
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
        onSave={(value) => {
          void saveInitialBalance(value);
          setIsInitialBalanceModalOpen(false);
        }}
        currentBalance={initialBalance}
      />

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        categories={categories}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  );
};

export default PlannerApp;
