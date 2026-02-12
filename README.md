# FinanceFlow Planner (Next.js)

FinanceFlow planner migrated to Next.js App Router.

## Prerequisites

- Node.js 20+

## Scripts

- `npm run dev` - run dev server on `http://localhost:3000`
- `npm run build` - production build
- `npm run start` - run production server on `http://localhost:3000`
- `npm run lint` - run Next.js ESLint checks
- `npm run typecheck` - run TypeScript checks

## Development

1. Install dependencies:
   `npm install`
2. Configure Supabase env (for repository layer):
   `NEXT_PUBLIC_SUPABASE_URL=...`
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...`
   `NEXT_PUBLIC_DEMO_USER_EMAIL=demo@financeplanner.com`
   `NEXT_PUBLIC_DEMO_USER_PASSWORD=...`
   `NEXT_PUBLIC_DEMO_CLEANUP_MINUTES=15`
3. Run development server:
   `npm run dev`

## Supabase Interface Layer

Prepared modules:

- `lib/planner/repository.ts` - app-level repository contract.
- `lib/supabase/client.ts` - typed browser client factory.
- `lib/supabase/database.types.ts` - DB typing based on current migration.
- `lib/supabase/planner-repository.ts` - Supabase implementation for planner CRUD.

## Auth

- The app now requires Supabase Auth session.
- Enable Email provider in Supabase Auth settings.
- Use built-in login screen (Sign In / Sign Up) before planner data loads.
- Demo login page is available at `/demo`.
- For demo user without email confirmation prompt, create/confirm this user in Supabase Dashboard first.
