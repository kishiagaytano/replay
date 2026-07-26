import type { TaskRepository } from "@/lib/data/repository";
import { LocalTaskRepository } from "@/lib/data/local-repository";
import { SupabaseTaskRepository } from "@/lib/data/supabase-repository";
import { isSupabaseEnabled, supabase } from "@/lib/data/supabase-client";

/**
 * Picks the backend at startup: shared Supabase if configured, otherwise
 * per-browser localStorage. This is the single line that decides where data
 * lives — everything else (store, components, pages) is unaware.
 */
export const taskRepository: TaskRepository = supabase
  ? new SupabaseTaskRepository(supabase)
  : new LocalTaskRepository();

export { isSupabaseEnabled };
