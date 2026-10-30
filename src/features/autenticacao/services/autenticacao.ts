import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/configs/supabase";

export type ResultadoLogin =
  | { tipo: "autenticado"; sessao: Session }
  | { tipo: "cancelado" };

let codigoConcluido: string | null = null;
let sessaoConcluida: Session | null = null;
const trocasEmAndamento = new Map<string, Promise<Session>>();

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

export async function concluirLoginComCodigo(codigo: string): Promise<Session> {
  if (codigoConcluido === codigo && sessaoConcluida) return sessaoConcluida;

  const trocaExistente = trocasEmAndamento.get(codigo);
  if (trocaExistente) return trocaExistente;

  const troca = (async () => {
    const { data, error } = await clienteSupabase().auth.exchangeCodeForSession(codigo);
    if (error) throw error;
    if (!data.session) throw new Error("Não foi possível criar a sessão autenticada.");
    codigoConcluido = codigo;
    sessaoConcluida = data.session;
    return data.session;
  })();
  trocasEmAndamento.set(codigo, troca);
  try {
    return await troca;
  } finally {
    trocasEmAndamento.delete(codigo);
  }
}

function valorParametro(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

export async function entrarComGoogle(): Promise<ResultadoLogin> {
  if (Constants.executionEnvironment === "storeClient") {
    throw new Error("O login Google não funciona pelo Expo Go. Instale e abra uma development build do BairroAtivo para receber o retorno bairroativo://auth/callback.");
  }

  const cliente = clienteSupabase();
  const redirectTo = Linking.createURL("auth/callback", { scheme: "bairroativo" });
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

  return { tipo: "autenticado", sessao: await concluirLoginComCodigo(codigo) };
}

export async function sair() {
  const { error } = await clienteSupabase().auth.signOut({ scope: "local" });
  if (error) throw error;
}

WebBrowser.maybeCompleteAuthSession();

