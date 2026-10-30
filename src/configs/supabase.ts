import { AppState, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const endereco = process.env.EXPO_PUBLIC_SUPABASE_URL;
const chavePublicavel = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase =
  endereco && chavePublicavel
    ? createClient(endereco, chavePublicavel, {
        db: { schema: "howviii" },
        auth: {
          ...(Platform.OS === "web" ? {} : {
            storage: {
              getItem: SecureStore.getItemAsync,
              setItem: SecureStore.setItemAsync,
              removeItem: SecureStore.deleteItemAsync,
            },
          }),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          flowType: "pkce",
        },
      })
    : null;

if (supabase && Platform.OS !== "web") {
  if (AppState.currentState === "active") supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();

  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
