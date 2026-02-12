import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabaseEnv } from './env';

let browserClient: SupabaseClient<Database> | null = null;

export const getSupabaseBrowserClient = (): SupabaseClient<Database> => {
  if (browserClient) return browserClient;

  const { url, publishableKey } = getSupabaseEnv();
  browserClient = createClient<Database>(url, publishableKey);

  return browserClient;
};
