-- FinanceFlow initial schema for Supabase
-- Date: 2026-02-11

create extension if not exists pgcrypto;

-- Keep timestamps fresh on update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- User profile mirrors auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Logical budget board/plan per user
create table if not exists public.budget_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Main plan',
  base_currency text not null default 'MDL',
  initial_balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budget_plans_currency_chk check (base_currency in ('MDL', 'USD', 'EUR'))
);

create trigger set_budget_plans_updated_at
  before update on public.budget_plans
  for each row execute procedure public.set_updated_at();

-- Categories inside a plan
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.budget_plans(id) on delete cascade,
  name text not null,
  color text not null,
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists categories_plan_name_unique
  on public.categories (plan_id, lower(name));

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute procedure public.set_updated_at();

-- Planned amounts / expenses
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.budget_plans(id) on delete cascade,
  category_id uuid null references public.categories(id) on delete set null,
  amount_mdl numeric(14,2) not null,
  title text not null default '',
  is_spent boolean not null default false,
  spent_at timestamptz,
  source_currency text,
  source_amount numeric(14,2),
  fx_rate numeric(14,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_amount_positive_chk check (amount_mdl > 0),
  constraint transactions_source_currency_chk check (source_currency is null or source_currency in ('MDL', 'USD', 'EUR'))
);

create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.set_updated_at();

-- Useful indexes
create index if not exists budget_plans_user_id_idx on public.budget_plans(user_id);
create index if not exists categories_plan_sort_idx on public.categories(plan_id, sort_order);
create index if not exists transactions_plan_created_at_idx on public.transactions(plan_id, created_at desc);
create index if not exists transactions_category_id_idx on public.transactions(category_id);
create index if not exists transactions_plan_is_spent_idx on public.transactions(plan_id, is_spent);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.budget_plans enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- profiles: user accesses own row
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- budget_plans: owner-only access
create policy "budget_plans_select_own"
  on public.budget_plans
  for select
  using (auth.uid() = user_id);

create policy "budget_plans_insert_own"
  on public.budget_plans
  for insert
  with check (auth.uid() = user_id);

create policy "budget_plans_update_own"
  on public.budget_plans
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "budget_plans_delete_own"
  on public.budget_plans
  for delete
  using (auth.uid() = user_id);

-- categories: access only within owned plans
create policy "categories_select_owned_plan"
  on public.categories
  for select
  using (
    exists (
      select 1
      from public.budget_plans bp
      where bp.id = categories.plan_id
        and bp.user_id = auth.uid()
    )
  );

create policy "categories_insert_owned_plan"
  on public.categories
  for insert
  with check (
    exists (
      select 1
      from public.budget_plans bp
      where bp.id = categories.plan_id
        and bp.user_id = auth.uid()
    )
  );

create policy "categories_update_owned_plan"
  on public.categories
  for update
  using (
    exists (
      select 1
      from public.budget_plans bp
      where bp.id = categories.plan_id
        and bp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.budget_plans bp
      where bp.id = categories.plan_id
        and bp.user_id = auth.uid()
    )
  );

create policy "categories_delete_owned_plan"
  on public.categories
  for delete
  using (
    exists (
      select 1
      from public.budget_plans bp
      where bp.id = categories.plan_id
        and bp.user_id = auth.uid()
    )
  );

-- transactions: access only within owned plans
create policy "transactions_select_owned_plan"
  on public.transactions
  for select
  using (
    exists (
      select 1
      from public.budget_plans bp
      where bp.id = transactions.plan_id
        and bp.user_id = auth.uid()
    )
  );

create policy "transactions_insert_owned_plan"
  on public.transactions
  for insert
  with check (
    exists (
      select 1
      from public.budget_plans bp
      where bp.id = transactions.plan_id
        and bp.user_id = auth.uid()
    )
    and (
      transactions.category_id is null
      or exists (
        select 1
        from public.categories c
        where c.id = transactions.category_id
          and c.plan_id = transactions.plan_id
      )
    )
  );

create policy "transactions_update_owned_plan"
  on public.transactions
  for update
  using (
    exists (
      select 1
      from public.budget_plans bp
      where bp.id = transactions.plan_id
        and bp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.budget_plans bp
      where bp.id = transactions.plan_id
        and bp.user_id = auth.uid()
    )
    and (
      transactions.category_id is null
      or exists (
        select 1
        from public.categories c
        where c.id = transactions.category_id
          and c.plan_id = transactions.plan_id
      )
    )
  );

create policy "transactions_delete_owned_plan"
  on public.transactions
  for delete
  using (
    exists (
      select 1
      from public.budget_plans bp
      where bp.id = transactions.plan_id
        and bp.user_id = auth.uid()
    )
  );

-- Grants: RLS still applies, but roles need base table privileges
grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.budget_plans to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;

grant all privileges on public.profiles to service_role;
grant all privileges on public.budget_plans to service_role;
grant all privileges on public.categories to service_role;
grant all privileges on public.transactions to service_role;
