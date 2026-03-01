'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { usePathname } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import AuthScreen from './AuthScreen';
import DeleteEntityDialog from '@/features/delete-entity/ui/DeleteEntityDialog';
import InitialBalanceModal from './InitialBalanceModal';
import AddExpenseModal from './modals/AddExpenseModal';
import AppHeader from './sections/AppHeader';
import { useBudgetPlanner } from '../hooks/useBudgetPlanner';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { DEMO_CLEANUP_MINUTES, isDemoUserEmail } from '@/lib/demo-config';
import BoardView from '@/views/board/ui/BoardView';
import SettingsView from '@/views/settings/ui/SettingsView';

const PlannerSkeleton: React.FC = () => (
  <div className="min-h-screen px-3 sm:px-4 lg:px-5 py-4 md:py-6 space-y-6 animate-pulse">
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
const DND_TIP_DISMISSED_STORAGE_KEY = 'financeflow:dnd_tip_dismissed';

interface PendingDeleteAction {
  type: 'transaction' | 'category';
  id: string;
  label: string;
}

const DND_TX_PREFIX = 'tx:';
const DND_COL_PREFIX = 'col:';

const colDndId = (categoryId: string | null) => `${DND_COL_PREFIX}${categoryId ?? 'inbox'}`;
const parseTxId = (id: string) => (id.startsWith(DND_TX_PREFIX) ? id.slice(DND_TX_PREFIX.length) : null);
const parseColId = (id: string): string | null | undefined => {
  if (!id.startsWith(DND_COL_PREFIX)) return undefined;
  const raw = id.slice(DND_COL_PREFIX.length);
  return raw === 'inbox' ? null : raw;
};

const PlannerApp: React.FC = () => {
  const [isInitialBalanceModalOpen, setIsInitialBalanceModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [columnsLayout, setColumnsLayout] = useState<'scroll' | 'wrap'>('scroll');
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteAction | null>(null);
  const [isDndTipVisible, setIsDndTipVisible] = useState(false);
  const [activeDragTxId, setActiveDragTxId] = useState<string | null>(null);
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

  // Use refs to keep handlers stable even when transactions/categories change
  const transactionsRef = useRef(transactions);
  const categoriesRef = useRef(categories);
  useEffect(() => {
    transactionsRef.current = transactions;
    categoriesRef.current = categories;
  }, [transactions, categories]);

  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const isDemoUser = isDemoUserEmail(user?.email);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pathname = usePathname();
  const activeTab: 'board' | 'settings' = pathname === '/settings' ? 'settings' : 'board';

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
    (txId: string, categoryId: string | null, beforeTransactionId?: string | null, afterTransactionId?: string | null) => {
      void (async () => {
        const success = await moveTransaction(txId, categoryId, beforeTransactionId, afterTransactionId);
        if (!success) return;

        if (isDndTipVisible) {
          setIsDndTipVisible(false);
          localStorage.setItem(DND_TIP_DISMISSED_STORAGE_KEY, '1');
        }
      })();
    },
    [isDndTipVisible, moveTransaction],
  );

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 2 } });
  const keyboardSensor = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });
  const memoizedSensors = useSensors(pointerSensor, keyboardSensor);

  const activeDragTx = useMemo(
    () => transactions.find((tx) => tx.id === activeDragTxId) ?? null,
    [transactions, activeDragTxId]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = String(event.active.id);
    const parsed = parseTxId(id);
    if (!parsed) return;
    setActiveDragTxId(parsed);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragTxId(null);

      if (!over) return;

      const activeId = parseTxId(String(active.id));
      const overId = String(over.id);

      if (!activeId) return;

      const overTxId = parseTxId(overId);
      const overColId = parseColId(overId);

      const activeTx = transactionsRef.current.find((t) => t.id === activeId);
      if (!activeTx) return;

      let targetCategoryId: string | null = activeTx.categoryId;
      if (overColId !== undefined) {
        targetCategoryId = overColId;
      } else if (overTxId) {
        const overTx = transactionsRef.current.find((t) => t.id === overTxId);
        if (overTx) targetCategoryId = overTx.categoryId;
      }

      const sameColumn = activeTx.categoryId === targetCategoryId;
      const targetColumn = transactionsRef.current
        .filter((t) => t.categoryId === targetCategoryId)
        .sort((a, b) => a.sortRank.localeCompare(b.sortRank));

      if (overTxId) {
        const overIndex = targetColumn.findIndex((t) => t.id === overTxId);
        if (overIndex < 0) return;

        if (sameColumn) {
          const oldIndex = targetColumn.findIndex((t) => t.id === activeId);
          if (oldIndex < 0 || oldIndex === overIndex) return;

          const reordered = arrayMove(targetColumn, oldIndex, overIndex);
          const newIndex = reordered.findIndex((t) => t.id === activeId);
          const afterTxId = newIndex > 0 ? reordered[newIndex - 1].id : null;
          const beforeTxId = newIndex < reordered.length - 1 ? reordered[newIndex + 1].id : null;
          handleMoveTransaction(activeId, targetCategoryId, beforeTxId, afterTxId);
          return;
        }

        // Cross-column move rule: always append to the end of target column.
        const targetWithoutActive = targetColumn.filter((t) => t.id !== activeId);
        const afterTxId = targetWithoutActive.length > 0 ? targetWithoutActive[targetWithoutActive.length - 1].id : null;
        handleMoveTransaction(activeId, targetCategoryId, null, afterTxId);
        return;
      }

      const targetWithoutActive = targetColumn.filter((t) => t.id !== activeId);
      if (sameColumn) {
        // If we dropped over the same column container (not a specific item),
        // treat it as no-op to avoid accidental "jump to end" on imprecise collisions.
        return;
      }
      const afterTxId = targetWithoutActive.length > 0 ? targetWithoutActive[targetWithoutActive.length - 1].id : null;
      handleMoveTransaction(activeId, targetCategoryId, null, afterTxId);
    },
    [handleMoveTransaction], // Removed transactions dependency
  );

  const handleUpdateTransactionName = useCallback(
    (txId: string, name: string) => {
      void (async () => {
        const success = await updateTransactionName(txId, name);
        if (!success) return;
      })();
    },
    [updateTransactionName],
  );

  const handleUpdateTransactionAmount = useCallback(
    (txId: string, amount: number) => {
      void (async () => {
        const success = await updateTransactionAmount(txId, amount);
        if (!success) return;
      })();
    },
    [updateTransactionAmount],
  );

  const handleToggleTransactionSpent = useCallback(
    (txId: string) => {
      const tx = transactionsRef.current.find((item) => item.id === txId);
      if (!tx) return;

      void (async () => {
        const success = await toggleTransactionSpent(txId);
        if (!success) return;
        toast.success(tx.isSpent ? 'Transaction marked as planned.' : 'Transaction marked as spent.');
      })();
    },
    [toggleTransactionSpent],
  );

  const handleMarkCategorySpent = useCallback(
    (categoryId: string) => {
      const unspentCount = transactionsRef.current.filter((tx) => tx.categoryId === categoryId && !tx.isSpent).length;
      if (unspentCount === 0) return;

      void (async () => {
        const success = await markCategorySpent(categoryId);
        if (!success) return;
        toast.success('Category transactions updated.');
      })();
    },
    [markCategorySpent],
  );

  const requestDeleteTransaction = useCallback(
    (txId: string) => {
      const tx = transactionsRef.current.find((item) => item.id === txId);
      if (!tx) return;

      setPendingDelete({
        type: 'transaction',
        id: txId,
        label: tx.name.trim() || `${tx.amount.toLocaleString()} MDL`,
      });
    },
    [],
  );

  const requestDeleteCategory = useCallback(
    (categoryId: string) => {
      const category = categoriesRef.current.find((item) => item.id === categoryId);
      if (!category) return;

      setPendingDelete({
        type: 'category',
        id: categoryId,
        label: category.name,
      });
    },
    [],
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

  useEffect(() => {
    if (!hasInitialLoadCompleted) return;
    const dismissed = localStorage.getItem(DND_TIP_DISMISSED_STORAGE_KEY) === '1';
    setIsDndTipVisible(!dismissed);
  }, [hasInitialLoadCompleted]);

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
    <div className="min-h-screen px-3 sm:px-4 lg:px-5 py-4 md:py-6 pb-28 md:pb-8 space-y-5">
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

      {isDndTipVisible && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800 flex items-start justify-between gap-3">
          <p className="font-medium">Tip: drag expenses between categories using the dotted handle.</p>
          <button
            type="button"
            onClick={() => {
              setIsDndTipVisible(false);
              localStorage.setItem(DND_TIP_DISMISSED_STORAGE_KEY, '1');
            }}
            className="shrink-0 rounded-lg border border-indigo-200 px-2 py-1 text-xs font-semibold hover:bg-indigo-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Dismiss
          </button>
        </div>
      )}

      <AppHeader
        initialBalance={initialBalance}
        totalSpent={totalSpent}
        totalAllocated={totalAllocated}
        remainingBalance={remainingBalance}
        onOpenInitialBalanceModal={() => setIsInitialBalanceModalOpen(true)}
        activeTab={activeTab}
        userEmail={user.email ?? null}
        onSignOut={() => {
          void signOut();
        }}
      />

      {activeTab === 'board' ? (
        <BoardView
          categories={categories}
          transactions={transactions}
          uncategorizedTransactions={uncategorizedTransactions}
          layoutMode={columnsLayout}
          activeDragTx={activeDragTx}
          colDndId={colDndId}
          sensors={memoizedSensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onLayoutChange={setColumnsLayout}
          onMove={handleMoveTransaction}
          onUpdateName={handleUpdateTransactionName}
          onUpdateAmount={handleUpdateTransactionAmount}
          onToggleSpent={handleToggleTransactionSpent}
          onMarkAllSpent={handleMarkCategorySpent}
          onRemove={requestDeleteTransaction}
          onAddTransaction={handleAddTransaction}
        />
      ) : (
        <SettingsView
          categories={categories}
          onAddCategory={handleAddCategory}
          onDeleteCategory={requestDeleteCategory}
        />
      )}

      <button
        onClick={() => setIsAddExpenseModalOpen(true)}
        className={`fixed bottom-4 right-4 z-40 h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-400 transition-all hover:bg-indigo-700 active:scale-95 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16 md:hover:scale-110 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
          activeTab === 'board' ? 'flex' : 'hidden'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
        <span className="absolute right-16 hidden whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white opacity-0 transition-opacity pointer-events-none md:right-20 md:block md:group-hover:opacity-100">
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
        <DeleteEntityDialog
          isOpen={!!pendingDelete}
          entityType={pendingDelete.type}
          label={pendingDelete.label}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default PlannerApp;
