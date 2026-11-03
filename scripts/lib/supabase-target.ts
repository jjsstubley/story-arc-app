// Service-role Supabase client for dev scripts. Defaults to the local
// database (URL and key from `npx supabase status`); production needs
// `--target prod --yes` and reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// from .env.local.

import { execFileSync } from "node:child_process";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

export interface TargetOptions {
  target?: string;
  yes?: boolean;
}

export function connect({ target = "local", yes = false }: TargetOptions): { supabase: SupabaseClient; label: string } {
  if (target === "local") {
    const status = JSON.parse(
      execFileSync("npx", ["supabase", "status", "-o", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
    );
    return { supabase: createClient(status.API_URL, status.SERVICE_ROLE_KEY), label: `local (${status.API_URL})` };
  }

  if (target !== "prod") throw new Error(`Unknown --target ${target}; use local or prod`);
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  if (!yes) throw new Error(`This would write to production (${url}). Re-run with --yes.`);
  return { supabase: createClient(url, key), label: `PRODUCTION (${url})` };
}

/** All rows of one column, paging past PostgREST's 1,000-row limit */
export async function selectAllIds(
  supabase: SupabaseClient,
  table: string,
  column: string,
  filter?: { column: string; value: string }
): Promise<number[]> {
  const ids: number[] = [];
  for (let from = 0; ; from += 1000) {
    let query = supabase.from(table).select(column).range(from, from + 999);
    if (filter) query = query.eq(filter.column, filter.value);
    const { data, error } = await query;
    if (error) throw error;
    ids.push(...(data as unknown as Record<string, number>[]).map((row) => Number(row[column])));
    if (!data || data.length < 1000) return ids;
  }
}
