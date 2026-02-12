import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateCategoryInput,
  CreateTransactionInput,
  PlannerRepository,
  PlannerSnapshot,
  UpdateTransactionInput,
} from '@/lib/planner/repository';
import type { Category, Transaction } from '@/types';
import type { Database } from './database.types';
import { mapCategoryRowToModel, mapTransactionRowToModel } from './mappers';

const assertNoError = (error: { message: string } | null, context: string) => {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
};

interface PlanCandidate {
  id: string;
  initial_balance: string;
  created_at: string;
}

const pickBestPlan = (
  plans: PlanCandidate[],
  categoryRows: Array<{ plan_id: string }> = [],
  transactionRows: Array<{ plan_id: string }> = [],
): PlanCandidate => {
  const categoryCountByPlan = new Map<string, number>();
  const transactionCountByPlan = new Map<string, number>();

  categoryRows.forEach((row) => {
    categoryCountByPlan.set(row.plan_id, (categoryCountByPlan.get(row.plan_id) ?? 0) + 1);
  });

  transactionRows.forEach((row) => {
    transactionCountByPlan.set(row.plan_id, (transactionCountByPlan.get(row.plan_id) ?? 0) + 1);
  });

  return plans
    .slice()
    .sort((a, b) => {
      const aScore = (categoryCountByPlan.get(a.id) ?? 0) + (transactionCountByPlan.get(a.id) ?? 0) * 1000;
      const bScore = (categoryCountByPlan.get(b.id) ?? 0) + (transactionCountByPlan.get(b.id) ?? 0) * 1000;

      if (aScore !== bScore) {
        return bScore - aScore;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })[0];
};

export class SupabasePlannerRepository implements PlannerRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getOrCreateDefaultPlan(): Promise<{ id: string; initialBalance: number }> {
    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.getUser();

    assertNoError(userError, 'Failed to get current user');

    if (!user) {
      throw new Error('User is not authenticated');
    }

    const { data: existingPlans, error: existingPlanError } = await this.supabase
      .from('budget_plans')
      .select('id, initial_balance, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    assertNoError(existingPlanError, 'Failed to fetch budget plan');

    if (existingPlans && existingPlans.length > 0) {
      if (existingPlans.length === 1) {
        const onlyPlan = existingPlans[0];
        return { id: onlyPlan.id, initialBalance: Number(onlyPlan.initial_balance) };
      }

      const planIds = existingPlans.map((plan) => plan.id);

      const [{ data: categories, error: categoriesError }, { data: transactions, error: transactionsError }] =
        await Promise.all([
          this.supabase.from('categories').select('plan_id').in('plan_id', planIds),
          this.supabase.from('transactions').select('plan_id').in('plan_id', planIds),
        ]);

      assertNoError(categoriesError, 'Failed to inspect categories for budget plans');
      assertNoError(transactionsError, 'Failed to inspect transactions for budget plans');

      const bestPlan = pickBestPlan(existingPlans, categories ?? [], transactions ?? []);
      return { id: bestPlan.id, initialBalance: Number(bestPlan.initial_balance) };
    }

    const insertPlanPayload: Database['public']['Tables']['budget_plans']['Insert'] = {
      user_id: user.id,
      name: 'Main plan',
      base_currency: 'MDL',
      initial_balance: 0,
    };

    const { data: newPlan, error: newPlanError } = await this.supabase
      .from('budget_plans')
      .insert(insertPlanPayload)
      .select('id, initial_balance')
      .single();

    assertNoError(newPlanError, 'Failed to create budget plan');
    if (!newPlan) {
      throw new Error('Failed to create budget plan: empty response');
    }

    return { id: newPlan.id, initialBalance: Number(newPlan.initial_balance) };
  }

  async getSnapshot(planId: string): Promise<PlannerSnapshot> {
    const [{ data: plan, error: planError }, { data: categories, error: categoriesError }, { data: transactions, error: transactionsError }] =
      await Promise.all([
        this.supabase.from('budget_plans').select('id, initial_balance').eq('id', planId).single(),
        this.supabase
          .from('categories')
          .select('id, name, color, sort_order')
          .eq('plan_id', planId)
          .eq('is_archived', false)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
        this.supabase
          .from('transactions')
          .select('id, amount_mdl, title, category_id, created_at, is_spent')
          .eq('plan_id', planId)
          .order('created_at', { ascending: true }),
      ]);

    assertNoError(planError, 'Failed to fetch budget plan snapshot');
    assertNoError(categoriesError, 'Failed to fetch categories');
    assertNoError(transactionsError, 'Failed to fetch transactions');
    if (!plan) {
      throw new Error('Failed to fetch budget plan snapshot: plan not found');
    }

    return {
      planId: plan.id,
      initialBalance: Number(plan.initial_balance),
      categories: (categories ?? []).map(mapCategoryRowToModel),
      transactions: (transactions ?? []).map(mapTransactionRowToModel),
    };
  }

  async cleanupDemoData(keepPlanId: string): Promise<void> {
    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.getUser();

    assertNoError(userError, 'Failed to get current user for demo cleanup');
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const { data: plans, error: plansError } = await this.supabase
      .from('budget_plans')
      .select('id')
      .eq('user_id', user.id);

    assertNoError(plansError, 'Failed to fetch plans for demo cleanup');

    const planIdsToDelete = (plans ?? []).map((plan) => plan.id).filter((id) => id !== keepPlanId);

    const [
      { error: deleteTransactionsError },
      { error: deleteCategoriesError },
      { error: resetBalanceError },
      { error: deleteExtraPlansError },
    ] = await Promise.all([
      this.supabase.from('transactions').delete().eq('plan_id', keepPlanId),
      this.supabase.from('categories').delete().eq('plan_id', keepPlanId),
      this.supabase.from('budget_plans').update({ initial_balance: 0 }).eq('id', keepPlanId),
      planIdsToDelete.length > 0
        ? this.supabase.from('budget_plans').delete().in('id', planIdsToDelete)
        : Promise.resolve({ error: null }),
    ]);

    assertNoError(deleteTransactionsError, 'Failed to delete demo transactions');
    assertNoError(deleteCategoriesError, 'Failed to delete demo categories');
    assertNoError(resetBalanceError, 'Failed to reset demo initial balance');
    assertNoError(deleteExtraPlansError, 'Failed to delete extra demo plans');
  }

  async updateInitialBalance(planId: string, initialBalance: number): Promise<void> {
    const { error } = await this.supabase
      .from('budget_plans')
      .update({ initial_balance: initialBalance })
      .eq('id', planId);

    assertNoError(error, 'Failed to update initial balance');
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const insertCategoryPayload: Database['public']['Tables']['categories']['Insert'] = {
      plan_id: input.planId,
      name: input.name,
      color: input.color,
      sort_order: input.sortOrder ?? 0,
    };

    const { data, error } = await this.supabase
      .from('categories')
      .insert(insertCategoryPayload)
      .select('id, name, color, sort_order, plan_id, is_archived, created_at, updated_at')
      .single();

    assertNoError(error, 'Failed to create category');
    if (!data) {
      throw new Error('Failed to create category: empty response');
    }

    return mapCategoryRowToModel(data);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await this.supabase.from('categories').delete().eq('id', categoryId);

    assertNoError(error, 'Failed to delete category');
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const insertTransactionPayload: Database['public']['Tables']['transactions']['Insert'] = {
      plan_id: input.planId,
      category_id: input.categoryId ?? null,
      amount_mdl: input.amount,
      title: input.name ?? '',
      is_spent: input.isSpent ?? false,
      source_currency: input.sourceCurrency ?? null,
      source_amount: input.sourceAmount ?? null,
      fx_rate: input.fxRate ?? null,
    };

    const { data, error } = await this.supabase
      .from('transactions')
      .insert(insertTransactionPayload)
      .select('id, amount_mdl, title, category_id, created_at, is_spent, plan_id, spent_at, source_currency, source_amount, fx_rate, updated_at')
      .single();

    assertNoError(error, 'Failed to create transaction');
    if (!data) {
      throw new Error('Failed to create transaction: empty response');
    }

    return mapTransactionRowToModel(data);
  }

  async updateTransaction(transactionId: string, patch: UpdateTransactionInput): Promise<Transaction> {
    const updatePayload: Database['public']['Tables']['transactions']['Update'] = {};

    if ('categoryId' in patch) updatePayload.category_id = patch.categoryId ?? null;
    if ('name' in patch) updatePayload.title = patch.name ?? '';
    if ('isSpent' in patch) updatePayload.is_spent = patch.isSpent;
    if ('spentAt' in patch) updatePayload.spent_at = patch.spentAt ?? null;

    const { data, error } = await this.supabase
      .from('transactions')
      .update(updatePayload)
      .eq('id', transactionId)
      .select('id, amount_mdl, title, category_id, created_at, is_spent, plan_id, spent_at, source_currency, source_amount, fx_rate, updated_at')
      .single();

    assertNoError(error, 'Failed to update transaction');
    if (!data) {
      throw new Error('Failed to update transaction: empty response');
    }

    return mapTransactionRowToModel(data);
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await this.supabase.from('transactions').delete().eq('id', transactionId);

    assertNoError(error, 'Failed to delete transaction');
  }
}
