import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedServerClient: SupabaseClient | null = null;

export function getServerSupabaseClient(): SupabaseClient {
  if (cachedServerClient) return cachedServerClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server env vars are missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  cachedServerClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return cachedServerClient;
} 