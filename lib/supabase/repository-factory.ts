import { SupabasePlannerRepository } from './planner-repository';
import { getSupabaseBrowserClient } from './client';

export const createBrowserPlannerRepository = () => {
  return new SupabasePlannerRepository(getSupabaseBrowserClient());
};
