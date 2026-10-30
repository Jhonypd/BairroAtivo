import { createClient } from "@supabase/supabase-js";

const endereco = process.env.EXPO_PUBLIC_SUPABASE_URL;
const chavePublicavel = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase =
  endereco && chavePublicavel
    ? createClient(endereco, chavePublicavel, {
        db: { schema: "howviii" },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      })
    : null;
