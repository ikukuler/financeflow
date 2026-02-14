# Session Notes (2026-02-12)

## Completed Today
- Migrated project from Vite to Next.js App Router.
- Added Supabase integration layer:
  - `lib/planner/repository.ts`
  - `lib/supabase/*` (typed client, DB types, repository implementation)
- Switched app state from local-only to Supabase-backed planner data.
- Added auth flow:
  - `useSupabaseAuth` hook
  - `AuthScreen` with email/password sign in + sign up
  - Sign out in header
- Added `/demo` page with prefilled demo credentials and quick login.
- Added demo mode behavior:
  - top warning banner in planner for demo user
  - automatic cleanup (categories/transactions/reset plan) every 15 minutes
  - persistent TTL via `localStorage` (`financeflow:demo_cleanup_at`)
  - countdown timer in UI

## Key Env Vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy fallback still supported)
- `NEXT_PUBLIC_DEMO_USER_EMAIL`
- `NEXT_PUBLIC_DEMO_USER_PASSWORD`
- `NEXT_PUBLIC_DEMO_CLEANUP_MINUTES`

## Important Notes
- If Supabase env is missing, app now shows UI error instead of hard crash.
- Demo cleanup timer no longer resets on page reload.
- If multiple budget plans exist, repository tries to pick the most active one.

## Suggested Next Steps
- Add a route for demo cleanup.
- Add user-visible toast for cleanup success/failure.
- Add ability to edit transactions.
- Add integration tests for auth + demo cleanup behavior.

---

# Session Notes (2026-02-14)

## Completed Today
- Added demo cleanup API route:
  - `app/api/demo/cleanup/route.ts`
  - validates bearer token + user session
  - allows cleanup only for demo user email
- Switched demo auto-cleanup in planner UI to call the new route (`/api/demo/cleanup`) instead of direct client cleanup call.
- Added success/error notifications for cleanup.
- Added full transaction editing support for amount updates:
  - `UpdateTransactionInput.amount` in repository contract
  - Supabase repository update payload now supports `amount_mdl`
  - inline amount editing in `TransactionItem`
- Added delete confirmation modal flow (transaction/category) in planner.
- Replaced custom toast system with `sonner`:
  - `Toaster` in top-right with `richColors`
  - add/update/delete success notifications
  - error notifications from planner operations
- Replaced custom `SearchableSelect` implementation with `react-select`:
  - menu rendered via portal (`document.body`)
  - fixed z-index/overflow clipping issues
  - preserved existing component API (`value: string | null`, `onChange`)
- Improved cursor UX consistency by adding explicit cursor styles to interactive elements (buttons/backdrops/actions) across planner/auth/modals.
- Created structured UI improvement backlog from provided desktop/mobile screenshots:
  - `UI_UX_IMPROVEMENTS.md`

## Important Notes
- Build check in sandbox can fail with Turbopack process restrictions (`Operation not permitted`) unrelated to code; lint/typecheck were used as verification baseline. Always ask to run `build` but ONLY if needed.
- `useBudgetPlanner` action methods now return `boolean` success status, enabling centralized toast handling in `PlannerApp`.
- Mobile issue identified and documented: transaction action buttons were hover-only and need explicit touch-visible behavior.

## Suggested Next Steps
- Implement items from `UI_UX_IMPROVEMENTS.md` in order, starting with critical mobile action visibility (no hover-only controls).
- Add integration tests (auth + demo cleanup behavior) once UI stabilization is done.
