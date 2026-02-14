import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { SupabasePlannerRepository } from '@/lib/supabase/planner-repository';
import type { Database } from '@/lib/supabase/database.types';
import { isDemoUserEmail } from '@/lib/demo-config';

interface CleanupPayload {
  keepPlanId?: string;
}

const unauthorized = (message: string, status = 401) => NextResponse.json({ error: message }, { status });

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorized('Missing bearer token');
  }

  const accessToken = authHeader.slice(7).trim();
  if (!accessToken) {
    return unauthorized('Empty bearer token');
  }

  try {
    const { url, publishableKey } = getSupabaseEnv();
    const supabase = createClient<Database>(url, publishableKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return unauthorized(userError?.message ?? 'Unauthorized');
    }

    if (!isDemoUserEmail(user.email)) {
      return unauthorized('Cleanup route is available only for demo user', 403);
    }

    let payload: CleanupPayload = {};
    try {
      payload = (await request.json()) as CleanupPayload;
    } catch {
      payload = {};
    }

    const repository = new SupabasePlannerRepository(supabase);
    const plan = await repository.getOrCreateDefaultPlan();
    const keepPlanId = payload.keepPlanId ?? plan.id;

    await repository.cleanupDemoData(keepPlanId);

    return NextResponse.json({ ok: true, keepPlanId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cleanup demo data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
