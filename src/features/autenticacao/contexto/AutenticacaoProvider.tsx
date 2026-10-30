import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import type { Session, User } from "@supabase/supabase-js";
import * as autenticacao from "../services/autenticacao";
import type { ResultadoLogin } from "../services/autenticacao";

type ContextoAutenticacao = {
  usuario: User | null;
  autenticado: boolean;
  carregando: boolean;
  autenticando: boolean;
  erro: string | null;
  entrarComGoogle: () => Promise<ResultadoLogin | null>;
  sair: () => Promise<void>;
};

const Contexto = createContext<ContextoAutenticacao | null>(null);

function mensagemErro(erro: unknown) {
  return erro instanceof Error ? erro.message : "Não foi possível concluir a autenticação. Tente novamente.";
}

export function AutenticacaoProvider({ children }: PropsWithChildren) {
  const [sessao, definirSessao] = useState<Session | null>(null);
  const [carregando, definirCarregando] = useState(true);
  const [autenticando, definirAutenticando] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);
  const loginEmAndamento = useRef(false);
  const recebeuMudanca = useRef(false);

  useEffect(() => {
    let ativo = true;
    const cancelarObservacao = autenticacao.observarSessao((novaSessao) => {
      recebeuMudanca.current = true;
      if (ativo) {
        definirSessao(novaSessao);
        definirCarregando(false);
      }
    });

    autenticacao.restaurarSessao()
      .then((sessaoRestaurada) => {
        if (ativo && !recebeuMudanca.current) definirSessao(sessaoRestaurada);
      })
      .catch((erroRestauracao: unknown) => {
        if (ativo) definirErro(mensagemErro(erroRestauracao));
      })
      .finally(() => { if (ativo) definirCarregando(false); });

    return () => {
      ativo = false;
      cancelarObservacao();
    };
  }, []);

  const entrarComGoogle = useCallback(async () => {
    if (loginEmAndamento.current) return null;
    loginEmAndamento.current = true;
    definirAutenticando(true);
    definirErro(null);
    try {
      const resultado = await autenticacao.entrarComGoogle();
      if (resultado.tipo === "autenticado") definirSessao(resultado.sessao);
      return resultado;
    } catch (erroLogin) {
      definirErro(mensagemErro(erroLogin));
      return null;
    } finally {
      loginEmAndamento.current = false;
      definirAutenticando(false);
    }
  }, []);

  const sair = useCallback(async () => {
    definirAutenticando(true);
    definirErro(null);
    try {
      await autenticacao.sair();
      definirSessao(null);
    } catch (erroLogout) {
      definirErro(mensagemErro(erroLogout));
      throw erroLogout;
    } finally {
      definirAutenticando(false);
    }
  }, []);

  return (
    <Contexto.Provider value={{ usuario: sessao?.user ?? null, autenticado: Boolean(sessao?.user), carregando, autenticando, erro, entrarComGoogle, sair }}>
      {children}
    </Contexto.Provider>
  );
}

export function useAutenticacao() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useAutenticacao deve ser usado dentro de AutenticacaoProvider");
  return contexto;
}
