import { ENV } from "./_core/env";

/**
 * Server-side Supabase REST helper.  It deliberately keeps the service-role
 * key on the server; browser code must use only the publishable key.
 */
export function getSupabaseServerConfig() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.",
    );
  }

  return {
    url: ENV.supabaseUrl.replace(/\/+$/, ""),
    headers: {
      apikey: ENV.supabaseServiceRoleKey,
      Authorization: `Bearer ${ENV.supabaseServiceRoleKey}`,
    },
  };
}

/** A small health check suitable for deployment diagnostics; it returns no secret. */
export async function checkSupabaseConnection(): Promise<boolean> {
  const { url, headers } = getSupabaseServerConfig();
  const response = await fetch(`${url}/rest/v1/`, { headers });
  return response.ok;
}
