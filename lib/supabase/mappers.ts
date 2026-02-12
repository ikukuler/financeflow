import type { Category, Transaction } from '@/types';
import type { Database } from './database.types';

type CategoryRow = Pick<Database['public']['Tables']['categories']['Row'], 'id' | 'name' | 'color'>;
type TransactionRow = Pick<
  Database['public']['Tables']['transactions']['Row'],
  'id' | 'amount_mdl' | 'title' | 'category_id' | 'created_at' | 'is_spent'
>;

export const mapCategoryRowToModel = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  color: row.color,
});

export const mapTransactionRowToModel = (row: TransactionRow): Transaction => ({
  id: row.id,
  amount: Number(row.amount_mdl),
  name: row.title,
  categoryId: row.category_id,
  createdAt: new Date(row.created_at).getTime(),
  isSpent: row.is_spent,
});
