export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      budget_plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          base_currency: 'MDL' | 'USD' | 'EUR';
          initial_balance: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          base_currency?: 'MDL' | 'USD' | 'EUR';
          initial_balance?: string | number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          base_currency?: 'MDL' | 'USD' | 'EUR';
          initial_balance?: string | number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          plan_id: string;
          name: string;
          color: string;
          sort_order: number;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          name: string;
          color: string;
          sort_order?: number;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          name?: string;
          color?: string;
          sort_order?: number;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          plan_id: string;
          category_id: string | null;
          amount_mdl: string;
          title: string;
          is_spent: boolean;
          spent_at: string | null;
          source_currency: 'MDL' | 'USD' | 'EUR' | null;
          source_amount: string | null;
          fx_rate: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          category_id?: string | null;
          amount_mdl: string | number;
          title?: string;
          is_spent?: boolean;
          spent_at?: string | null;
          source_currency?: 'MDL' | 'USD' | 'EUR' | null;
          source_amount?: string | number | null;
          fx_rate?: string | number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          category_id?: string | null;
          amount_mdl?: string | number;
          title?: string;
          is_spent?: boolean;
          spent_at?: string | null;
          source_currency?: 'MDL' | 'USD' | 'EUR' | null;
          source_amount?: string | number | null;
          fx_rate?: string | number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
