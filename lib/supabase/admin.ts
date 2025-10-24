import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec les privilèges admin (service_role)
 * À utiliser UNIQUEMENT côté serveur dans les API routes
 * JAMAIS dans les composants clients
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Les variables d\'environnement Supabase ne sont pas configurées');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}