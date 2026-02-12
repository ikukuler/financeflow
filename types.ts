
export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  name: string;
  categoryId: string | null; // null means it's in the "Uncategorized" pool
  createdAt: number;
  isSpent: boolean;
}
