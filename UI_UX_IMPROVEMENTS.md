# UI/UX Improvements Backlog (Based on 2026-02-14 Screenshots)

## Context
- Sources:
  - Desktop screenshot: `[Image #1]`
  - Mobile screenshot: `[Image #2]`
- Goal: improve clarity, usability, mobile behavior, and visual hierarchy without changing core planner logic.

## 1) Critical UX Bugs (Fix First)

1. Transaction action buttons are hover-only (`spent/delete`) and not accessible on touch devices.
- Problem: on mobile there is no hover, so actions are hidden.
- Fix:
  - Always show action buttons on touch/small screens (`md:hidden` strategy or media query).
  - Keep hover-reveal only for desktop if desired.
  - Add minimum tap target `44x44px`.

2. Potential dropdown/menu clipping and stacking issues around cards and headers.
- Problem: controls can render under neighboring blocks (z-index/overflow contexts).
- Fix:
  - Keep select menu in portal (`document.body`) with high portal z-index.
  - Audit all overlays/modals/toasts for consistent z-index scale.

3. Floating add button overlaps content on mobile.
- Problem: FAB can cover transaction controls near bottom.
- Fix:
  - Add extra bottom padding to main content on mobile.
  - Slightly reduce FAB size on small screens (e.g. `56px -> 52px`).

## 2) High-Impact Visual Improvements

1. Strengthen hierarchy in top summary card.
- Current: metrics are readable, but labels/values compete for attention.
- Improve:
  - Increase contrast between labels and values.
  - Make one primary KPI (Remaining) visually dominant, others secondary.
  - Align metric baselines for cleaner scan.

2. Reduce visual noise in category cards.
- Current: many borders + tiny labels + light grays reduce scan speed.
- Improve:
  - Increase text size of transaction secondary lines (`Add name...`, small metadata).
  - Reduce border density in nested elements.
  - Use one accent color per card, less mixed accent usage.

3. Improve category chips readability.
- Current: chip labels are compact and crowded on mobile.
- Improve:
  - Increase horizontal padding and line-height.
  - Add wrap spacing (`gap`) slightly larger on mobile.
  - Make remove icon easier to tap.

## 3) Mobile-Specific UX Improvements

1. Transaction card actions redesign for mobile.
- Replace hover actions with explicit always-visible icon row.
- Recommended layout:
  - Right top: `spent`, `delete`
  - Left/center: amount and name (tap to edit)
- Ensure no accidental drag when trying to tap action icons.

2. Drag-and-drop fallback for mobile.
- Problem: drag UX is weaker on touch devices.
- Improve:
  - Keep category select dropdown as primary move mechanism on mobile.
  - Optionally disable drag gestures under certain breakpoint and rely on select.

3. Header responsiveness.
- Current: header feels dense on narrow widths.
- Improve:
  - Move user email/sign out into one compact row.
  - Keep action button (`Set Initial Sum`) full-width or clearly separated.
  - Increase vertical spacing between metric rows.

## 4) Interaction & Feedback Improvements

1. Action feedback consistency.
- Keep success toasts for add/update/delete.
- For frequent micro-updates (e.g. rename/move) consider reducing toast noise:
  - Either debounce toasts
  - Or show only for add/delete/spent-toggle

2. Destructive actions confirmation.
- Already added for delete; improve:
  - Include entity type + readable label in modal title/body.
  - Autofocus safe action (`Cancel`), destructive action secondary.

3. Empty states.
- `Unallocated Pool` empty state is clear; apply similarly across category empty blocks:
  - Add one clear CTA, e.g. “Add expense”.

## 5) Typography and Spacing Tune-Up

1. Increase minimum readable size in dense areas.
- Avoid ultra-small labels where possible (`10px` -> `11-12px` for mobile critical text).

2. Consistent spacing scale.
- Normalize vertical rhythm inside cards:
  - title row
  - totals row
  - transactions grid/list

3. Numeric formatting consistency.
- Keep consistent thousand separators and decimal precision rules across:
  - header totals
  - category totals
  - transaction amounts

## 6) Accessibility Improvements

1. Touch targets.
- All actionable icons/buttons should meet ~44x44px on mobile.

2. Focus visibility.
- Ensure keyboard focus ring is visible on all buttons/select controls.

3. Color contrast.
- Recheck muted gray text and tiny labels against WCAG contrast, especially over light backgrounds.

## 7) Implementation Plan (Suggested Order)

1. Mobile action visibility + tap target fixes (critical).
2. Header and metric hierarchy cleanup.
3. Category/transaction card spacing and text-size adjustments.
4. Toast noise tuning and destructive modal polish.
5. Accessibility pass (focus + contrast + touch targets).

## 8) Acceptance Checklist

- [ ] On mobile, transaction action buttons are visible without hover.
- [ ] No interactive element requires hover-only discovery.
- [ ] No dropdown/menu is clipped by parent overflow.
- [ ] FAB does not block content/actions on smallest target viewport.
- [ ] Key labels/amounts are readable at a glance on mobile and desktop.
- [ ] Delete confirmation modal is clear and safe by default.
- [ ] `lint` and `typecheck` pass after UI changes.
