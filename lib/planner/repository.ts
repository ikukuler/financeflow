import type { Category, Transaction } from '@/types';

export interface PlannerSnapshot {
  planId: string;
  initialBalance: number;
  categories: Category[];
  transactions: Transaction[];
}

export interface CreateCategoryInput {
  planId: string;
  name: string;
  color: string;
  sortOrder?: number;
}

export interface CreateTransactionInput {
  planId: string;
  amount: number;
  name?: string;
  categoryId?: string | null;
  isSpent?: boolean;
  sourceCurrency?: 'MDL' | 'USD' | 'EUR' | null;
  sourceAmount?: number | null;
  fxRate?: number | null;
}

export interface UpdateTransactionInput {
  categoryId?: string | null;
  name?: string;
  isSpent?: boolean;
  spentAt?: string | null;
}

export interface PlannerRepository {
  getOrCreateDefaultPlan(): Promise<{ id: string; initialBalance: number }>;
  getSnapshot(planId: string): Promise<PlannerSnapshot>;
  cleanupDemoData(keepPlanId: string): Promise<void>;
  updateInitialBalance(planId: string, initialBalance: number): Promise<void>;
  createCategory(input: CreateCategoryInput): Promise<Category>;
  deleteCategory(categoryId: string): Promise<void>;
  createTransaction(input: CreateTransactionInput): Promise<Transaction>;
  updateTransaction(transactionId: string, patch: UpdateTransactionInput): Promise<Transaction>;
  deleteTransaction(transactionId: string): Promise<void>;
}
