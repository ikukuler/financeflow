-- Kanban Phase 1 migration
-- Date: 2026-02-19

-- 1) budget_plans: explicit arbitrary period support
alter table public.budget_plans
  add column if not exists period_start date,
  add column if not exists period_end date;

-- Backfill from existing created_at month window where missing
update public.budget_plans
set
  period_start = coalesce(period_start, date_trunc('month', created_at)::date),
  period_end = coalesce(period_end, (date_trunc('month', created_at) + interval '1 month - 1 day')::date)
where period_start is null or period_end is null;

-- Keep inserts compatible with current app before board-period UI is shipped
alter table public.budget_plans
  alter column period_start set default date_trunc('month', now())::date,
  alter column period_end set default (date_trunc('month', now()) + interval '1 month - 1 day')::date;

alter table public.budget_plans
  alter column period_start set not null,
  alter column period_end set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'budget_plans_period_range_valid_chk'
      and conrelid = 'public.budget_plans'::regclass
  ) then
    alter table public.budget_plans
      add constraint budget_plans_period_range_valid_chk
      check (period_start <= period_end);
  end if;
end
$$;

create index if not exists budget_plans_user_period_idx
  on public.budget_plans(user_id, period_start desc, period_end desc);

-- 2) transactions: ordered kanban rows + direction semantics
alter table public.transactions
  add column if not exists sort_rank text,
  add column if not exists direction text;

-- Backfill direction first
update public.transactions
set direction = coalesce(direction, 'expense')
where direction is null;

-- Backfill sort_rank deterministically by historical order inside each column
with ranked as (
  select
    id,
    lpad(row_number() over (
      partition by plan_id, category_id
      order by created_at asc, id asc
    )::text, 12, '0') as new_rank
  from public.transactions
)
update public.transactions t
set sort_rank = r.new_rank
from ranked r
where t.id = r.id
  and t.sort_rank is null;

-- Keep inserts compatible with current app until move/reorder methods are shipped
alter table public.transactions
  alter column direction set default 'expense',
  alter column sort_rank set default to_char((extract(epoch from clock_timestamp()) * 1000000)::bigint, 'FM0000000000000000');

alter table public.transactions
  alter column direction set not null,
  alter column sort_rank set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_direction_chk'
      and conrelid = 'public.transactions'::regclass
  ) then
    alter table public.transactions
      add constraint transactions_direction_chk
      check (direction in ('expense', 'income'));
  end if;
end
$$;

create index if not exists transactions_plan_category_rank_idx
  on public.transactions(plan_id, category_id, sort_rank);

-- 3) transactions.category_id FK now cascades on category delete
alter table public.transactions
  drop constraint if exists transactions_category_id_fkey;

alter table public.transactions
  add constraint transactions_category_id_fkey
  foreign key (category_id)
  references public.categories(id)
  on delete cascade;
