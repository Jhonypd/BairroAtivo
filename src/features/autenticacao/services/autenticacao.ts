import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/configs/supabase";

export type ResultadoLogin =
  | { tipo: "autenticado"; sessao: Session }
  | { tipo: "cancelado" };

function clienteSupabase() {
  if (!supabase) throw new Error("A conexão com o Supabase não está configurada.");
  return supabase;
}

export async function restaurarSessao() {
  const { data, error } = await clienteSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}

export function observarSessao(notificar: (sessao: Session | null) => void) {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => {
    notificar(sessao);
  });
  return () => data.subscription.unsubscribe();
}

function valorParametro(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

export async function entrarComGoogle(): Promise<ResultadoLogin> {
  const cliente = clienteSupabase();
  const redirectTo = Linking.createURL("auth/callback");
  const { data, error } = await cliente.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error("Não foi possível iniciar o login com Google.");

  const retorno = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (retorno.type !== "success") return { tipo: "cancelado" };

  const parametros = Linking.parse(retorno.url).queryParams;
  const descricaoErro = valorParametro(parametros?.error_description as string | string[] | undefined);
  if (descricaoErro) throw new Error(descricaoErro);
  const codigo = valorParametro(parametros?.code as string | string[] | undefined);
  if (!codigo) throw new Error("O Google não retornou um código de autenticação.");

  const { data: dadosSessao, error: erroTroca } = await cliente.auth.exchangeCodeForSession(codigo);
  if (erroTroca) throw erroTroca;
  if (!dadosSessao.session) throw new Error("Não foi possível criar a sessão autenticada.");
  return { tipo: "autenticado", sessao: dadosSessao.session };
}

export async function sair() {
  const { error } = await clienteSupabase().auth.signOut({ scope: "local" });
  if (error) throw error;
}

WebBrowser.maybeCompleteAuthSession();

