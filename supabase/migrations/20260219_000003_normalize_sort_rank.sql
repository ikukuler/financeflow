-- Normalize transaction sort ranks to a single canonical format
-- Date: 2026-02-19

-- Canonical format:
-- - numeric string only
-- - fixed width (18 chars)
-- - gap step 1024

-- 1) Rebuild ranks per (plan_id, category_id), preserving current visual order as much as possible
with ranked as (
  select
    id,
    row_number() over (
      partition by plan_id, category_id
      order by
        case
          when sort_rank ~ '^[0-9]+$' then lpad(sort_rank, 18, '0')
          else null
        end asc nulls last,
        created_at asc,
        id asc
    ) as rn
  from public.transactions
)
update public.transactions t
set sort_rank = lpad((ranked.rn * 1024)::text, 18, '0')
from ranked
where t.id = ranked.id;

-- 2) Enforce canonical default for all future inserts
alter table public.transactions
  alter column sort_rank set default lpad((extract(epoch from clock_timestamp()) * 1000000)::bigint::text, 18, '0');

-- 3) Guardrail constraints for format consistency
alter table public.transactions
  drop constraint if exists transactions_sort_rank_format_chk;

alter table public.transactions
  add constraint transactions_sort_rank_format_chk
  check (sort_rank ~ '^[0-9]{18}$');
