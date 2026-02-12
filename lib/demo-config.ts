export const DEMO_USER_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_USER_EMAIL?.trim().toLowerCase() ?? 'demo@financeplanner.com';

export const DEMO_USER_PASSWORD =
  process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD ?? 'DemoPass123!';

export const DEMO_CLEANUP_MINUTES = Number(process.env.NEXT_PUBLIC_DEMO_CLEANUP_MINUTES ?? '15');

export const isDemoUserEmail = (email: string | null | undefined) =>
  !!email && email.trim().toLowerCase() === DEMO_USER_EMAIL;
