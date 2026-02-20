import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

export const supabase = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);