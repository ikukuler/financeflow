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
<!-- - Add integration tests (auth + demo cleanup behavior) once UI stabilization is done. -->

---

# Session Notes (2026-02-19)

## Completed Today
- Implemented major UI/UX pass from backlog and screenshot feedback:
  - mobile-visible transaction actions (no hover-only discovery)
  - larger touch targets and stronger focus-visible states
  - reduced FAB overlap risk on mobile (`pb-28`, smaller mobile FAB)
  - improved summary hierarchy with dominant `Remaining`
  - compact responsive header/user controls
  - reduced toast noise for frequent micro-updates
- Improved categories toolbar scalability:
  - horizontal chip scrolling in compact mode
  - `Show all / Collapse categories` behavior
  - overflow containment and truncation fixes for long category names
- Added financial readability improvements:
  - `tabular-nums` for key amounts in header/categories/transactions
  - clearer negative-state microcopy: `Over budget by X MDL`
  - neutralized `Total Spent` coloring to avoid misleading success semantics
- Improved drag-and-drop affordance and feedback:
  - explicit drag handle on desktop
  - drag-only initiation from handle to avoid button/input conflicts
  - stronger drag/drop visual states (`scale/ring/shadow` + drop overlays)
  - onboarding tip banner for DnD with persistent dismissal (`localStorage`)
- Reframed unallocated area as inbox pattern:
  - `Inbox / Unallocated` labeling
  - clearer empty-state guidance
- Reworked transaction presentation into table-like row layout while preserving DnD:
  - row-oriented transaction items
  - desktop column headers (`Expense / Amount / Actions`) in categories and inbox
  - mobile-safe fallback layout to prevent control overlap
- Inbox-specific comment usability fix:
  - always-visible comment input for inbox transactions (`forceNameInput`)
  - prevented actions overflow in narrow columns by shifting desktop row mode to `lg` breakpoint

## Important Notes
- A dedicated implementation branch was used for table+DND refactor: `table-dnd-transactions`.
- Branch has been merged by user.
- Validation baseline for this session: `npm run lint` and `npm run typecheck` passed after final fixes.

## Suggested Next Steps
- For Kanban rework kickoff, start from `KANBAN_REWORK_SPEC.md` (source of truth for Phase 1 scope and migration plan).

## Update (2026-02-19, later session)
- Started Kanban Phase 1 implementation (DB + repository + UI shell):
  - Added migration: `supabase/migrations/20260219_000002_kanban_phase1.sql`
    - `budget_plans.period_start`, `budget_plans.period_end`
    - `transactions.sort_rank`, `transactions.direction`
    - `transactions.category_id` FK switched to `ON DELETE CASCADE`
  - Added rank normalization migration: `supabase/migrations/20260219_000003_normalize_sort_rank.sql`
    - canonical 18-digit rank format
    - default + constraint guard for `sort_rank`
- Extended planner/repository model for Kanban data:
  - `periodStart`/`periodEnd` in snapshot/plan result
  - `sortRank`/`direction` on transaction model
  - move/reorder repository methods for DnD
- Updated Supabase mapping/types to include new columns:
  - `lib/supabase/database.types.ts`
  - `lib/supabase/mappers.ts`
  - `lib/supabase/planner-repository.ts`
- Updated hook behavior:
  - `moveTransaction` now supports positional anchors (`beforeTransactionId` / `afterTransactionId`)
  - category delete optimistic logic aligned with cascade semantics
- Added UI shell changes for Kanban workflow:
  - full-width board layout with compact paddings
  - board layout modes: `scroll` / `wrap`
  - mobile bottom tab bar: `Board / Add / Settings`
  - new settings panel with category create/delete:
    - `components/sections/SettingsPanel.tsx`
- Replaced native drag logic with `dnd-kit` integration:
  - `DndContext` + sortable items/columns
  - drag handle-based interaction
  - `DragOverlay`
- Fixed DnD persistence/reorder issues:
  - deterministic `onDragEnd` path for same-column reorder and cross-column move
  - cross-column move rule: append to end of target column
  - removed unstable `onDragOver` optimistic category mutation
  - removed render-time ref hacks that caused lint errors and unstable behavior
- Performance tuning pass:
  - reduced pointer activation distance
  - disabled `autoScroll` in `DndContext`
  - memoized heavy board sections (`CategoryBlock`, `CategoriesGrid`, `UnallocatedPool`)
  - applied `touch-action: none` to drag handle
- Validation status for this session:
  - `npm run lint` passed after fixes
  - `npm run typecheck` passed after fixes

## Kanban Spec: Remaining Work (after 2026-02-19 session)
- Board periods are not yet exposed as full UI flows:
  - no explicit create/select/manage board period UX (`period_start`/`period_end` are in DB/repository, but not fully productized in UI)
- Navigation shell is only partially aligned:
  - Board/Add/Settings are usable
  - Insights is not implemented (left for next phase)
- Test scope from spec is still pending:
  - repository tests for move/reorder and cascade delete behavior
  - UI integration tests for desktop DnD, mobile select move, same-column reorder
- DnD performance/UX still needs final stabilization pass:
  - occasional drag-start lag/freeze reported by user under real usage
  
  ## Out of Scope (Phase 2)
- `safe daily`, `burn rate`, projections
- recurring/automation
- advanced insights and goals
