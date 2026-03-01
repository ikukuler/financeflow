# Shadcn Migration Plan

## Goal
- Migrate core application UI to `shadcn/ui` primitives without touching the Kanban board internals or the current `SearchableSelect` implementation.
- Keep navigation, dialogs, auth, and settings consistent with the existing Next.js + FSD structure.

## Progress
- [x] Phase 1: UI Foundation
- [x] Phase 2: App Shell
- [x] Phase 3: Modal Layer
- [x] Phase 4: Delete Confirmation
- [x] Phase 5: Settings UI
- [x] Phase 6: Auth UI
- [x] Phase 7: Non-Board Forms

## Current Status
- Status: Core migration completed
- Started: 2026-02-28
- Last updated: 2026-02-28
- Notes:
  - Do not touch Kanban board internals during the first migration pass.
  - The project now uses CLI-generated `shadcn/ui` components in `components/ui` and `cn` from `lib/utils`.
  - Webpack is used for local Next.js scripts to avoid the Turbopack CSS export issue encountered with `shadcn` package styles.

## Out of Scope
- Board DnD layout and behavior
- Deep refactor of transaction rows and category columns
- Visual redesign of the product beyond component-system migration

## Target Structure
- `app/`
  - route entrypoints and layouts
- `views/`
  - route-level screen composition
- `widgets/`
  - large UI sections such as planner header and settings area
- `features/`
  - user actions such as add transaction, update initial balance, delete entity
- `entities/`
  - domain UI blocks if needed later
- `components/ui/`
  - CLI-generated `shadcn/ui` primitives
- `lib/`
  - shared helpers such as `cn`
- `shared/config/`
  - routes and UI config

## Phase 1: UI Foundation
- [x] Initialize `shadcn` CLI in the project
- [x] Generate base UI primitives with the CLI
- [x] Use `clsx` + `tailwind-merge` via `lib/utils.ts`
- [x] Align project scripts with a working bundler setup for shadcn styles

- Add `shadcn/ui` base primitives in `components/ui`:
  - `button`
  - `input`
  - `label`
  - `card`
  - `dialog`
  - `alert-dialog`
  - `sheet`
  - `dropdown-menu`
  - `separator`
  - `textarea`
  - `badge`
- Add shared utility layer:
  - `lib/utils.ts` with `clsx` + `tailwind-merge`
- Keep styling tokens aligned with current Tailwind setup.

## Phase 2: App Shell
- [x] Migrate `components/sections/AppHeader.tsx`
- [x] Replace mobile burger with `Sheet`
- [x] Replace nav/action primitives with shadcn equivalents
- [x] Preserve `/board` and `/settings` routing behavior

- Migrate top navigation in `components/sections/AppHeader.tsx`
- Replace current mobile burger implementation with `Sheet`
- Replace nav/action primitives with `shadcn` buttons and menu primitives
- Preserve route-based navigation for `/board` and `/settings`

## Phase 3: Modal Layer
- [x] Migrate `components/InitialBalanceModal.tsx` to `Dialog`
- [x] Migrate `components/modals/AddExpenseModal.tsx` to `Dialog`
- [x] Preserve current submit and close behavior

- Migrate `components/InitialBalanceModal.tsx` to `Dialog`
- Migrate `components/modals/AddExpenseModal.tsx` to `Dialog`
- Preserve existing business logic and submit flows

## Phase 4: Delete Confirmation
- [x] Extract delete confirmation from `components/PlannerApp.tsx`
- [x] Create feature-level dialog component
- [x] Replace custom markup with `AlertDialog`

- Extract delete confirmation from `components/PlannerApp.tsx`
- Create a dedicated feature component, for example:
  - `features/delete-entity/ui/DeleteEntityDialog.tsx`
- Implement it with `AlertDialog`

## Phase 5: Settings UI
- [x] Migrate `components/sections/SettingsPanel.tsx`
- [x] Replace current controls with shadcn primitives
- [x] Keep category logic unchanged

- Migrate `components/sections/SettingsPanel.tsx`
- Replace current primitives with:
  - `Card`
  - `Input`
  - `Button`
  - `Separator`
  - optional `Badge`
- Keep category add/delete logic unchanged

## Phase 6: Auth UI
- [x] Migrate `components/AuthScreen.tsx`
- [x] Replace current auth controls with shadcn primitives
- [x] Decide whether `Tabs` improve the sign-in/sign-up switch

- Migrate `components/AuthScreen.tsx`
- Replace current primitives with:
  - `Card`
  - `Input`
  - `Label`
  - `Button`
- Optional:
  - use `Tabs` for sign-in/sign-up switch if it improves clarity

## Phase 7: Non-Board Forms
- [x] Review `components/NewTransactionForm.tsx`
- [x] Migrate safe form primitives
- [x] Replace `SearchableSelect` with shadcn `Combobox` including auto-highlight behavior

- Review and migrate `components/NewTransactionForm.tsx`
- Use shared form primitives where it does not affect board-specific interactions
- Replace the category picker with a shadcn `Combobox` when the generated component is available

## Deferred Work
- `components/TransactionItem.tsx`
- `components/CategoryBlock.tsx`
- `views/board/ui/BoardView.tsx`
- `components/SearchableSelect.tsx`

These should remain custom for now because they combine domain-specific UI, mobile behavior, and DnD interaction complexity.

## Completed Scope
1. [x] Initialize shadcn and base UI primitives
2. [x] Migrate app shell/header
3. [x] Migrate modal layer
4. [x] Extract delete confirmation
5. [x] Migrate settings UI
6. [x] Migrate auth UI
7. [x] Migrate non-board forms and replace category picker with shadcn combobox

## Remaining Scope
1. [ ] Migrate `components/TransactionItem.tsx`
2. [ ] Migrate `components/CategoryBlock.tsx`
3. [ ] Review `views/board/ui/BoardView.tsx` for any remaining primitive-level cleanup
4. [ ] Decide whether `components/SearchableSelect.tsx` should keep its current wrapper API or be renamed to reflect combobox usage

## Expected Outcome
- Consistent UI primitives across navigation, dialogs, auth, and settings
- Lower custom UI maintenance cost
- No disruption to the existing board and searchable category flow
- Better base for future migration of board-adjacent components if needed

## Change Log
- 2026-02-28: Initial migration plan created
- 2026-02-28: Added checklist-based progress tracking and current status section
- 2026-02-28: Initialized `shadcn` CLI and generated base UI primitives
- 2026-02-28: Switched Next.js scripts to webpack to avoid Turbopack CSS export issues with shadcn-related package styles
- 2026-02-28: Migrated `AppHeader` to CLI-generated shadcn primitives without changing route behavior
- 2026-02-28: Replaced the mobile burger menu in `AppHeader` with shadcn `Sheet`
- 2026-02-28: Migrated `InitialBalanceModal` and `AddExpenseModal` to shadcn `Dialog`
- 2026-02-28: Extracted delete confirmation into `features/delete-entity/ui/DeleteEntityDialog.tsx` using shadcn `AlertDialog`
- 2026-02-28: Migrated `SettingsPanel` to shadcn primitives while preserving category logic
- 2026-02-28: Migrated `AuthScreen` to shadcn primitives and kept the sign-in/sign-up switch as a lightweight segmented control
- 2026-02-28: Replaced `SearchableSelect` with a shadcn `Combobox` using auto-highlight and migrated `NewTransactionForm` to shadcn form primitives
