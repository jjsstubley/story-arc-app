import { supabase } from "~/utils/supabaseClient";


export const getUserSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
};