import { supabase } from "@/configs/supabase";
import { rotuloCategoriaBanco } from "../data/opcoesOcorrencia";
import type { Ocorrencia } from "../types/Ocorrencia";
import type {
  CategoriaOcorrenciaBanco,
  OcorrenciaBanco,
  StatusOcorrenciaBanco,
} from "../types/OcorrenciaBanco";
import type { DadosCadastroOcorrencia } from "../validacoes/cadastroOcorrencia";

export type FiltrosOcorrencia = {
  titulo?: string;
  bairro?: string;
  categoria?: CategoriaOcorrenciaBanco;
  status?: StatusOcorrenciaBanco;
};

const status: Record<StatusOcorrenciaBanco, Ocorrencia["status"]> = {
  aberta: "Aberta",
  em_acompanhamento: "Em acompanhamento",
  resolvida: "Resolvida",
};

export function converterOcorrencia(dado: OcorrenciaBanco): Ocorrencia {
  return {
    id: dado.id,
    titulo: dado.titulo,
    descricao: dado.descricao,
    categoria: rotuloCategoriaBanco(dado.categoria),
    bairro: dado.bairro,
    status: status[dado.status],
    registradaEm: new Date(dado.criado_em).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }),
    ...(dado.nome_publico?.trim()
      ? { nomeAutorPublico: dado.nome_publico.trim() }
      : {}),
  };
}

type ClienteOcorrencias = NonNullable<typeof supabase>;

function exigirCliente(cliente: ClienteOcorrencias | null): ClienteOcorrencias {
  if (!cliente) {
    throw new Error("A conexão com o Supabase não está configurada.");
  }
  return cliente;
}

const camposPublicos =
  "id,titulo,descricao,categoria,bairro,status,criado_em,nome_publico";

export async function cadastrarOcorrencia(
  dados: DadosCadastroOcorrencia,
  cliente: ClienteOcorrencias | null = supabase,
): Promise<Ocorrencia> {
  const clienteConfigurado = exigirCliente(cliente);
  const { data: autenticacao, error: erroAutenticacao } =
    await clienteConfigurado.auth.getUser();
  if (erroAutenticacao) {
    throw new Error("Não foi possível validar sua sessão. Verifique a conexão e tente novamente.");
  }
  if (!autenticacao.user) {
    throw new Error("Faça login para cadastrar uma ocorrência.");
  }

  const { data, error } = await clienteConfigurado
    .from("ocorrencias")
    .insert({
      titulo: dados.titulo.trim(),
      descricao: dados.descricao.trim(),
      categoria: dados.categoria,
      bairro: dados.bairro.trim(),
      autor_id: autenticacao.user.id,
      nome_publico: dados.nomePublico?.trim() || null,
    })
    .select(camposPublicos)
    .single();

  if (error || !data) {
    throw new Error("Não foi possível cadastrar a ocorrência. Tente novamente.");
  }

  return converterOcorrencia(data as unknown as OcorrenciaBanco);
}

export async function listarOcorrencias(
  filtros: FiltrosOcorrencia = {},
  cliente: ClienteOcorrencias | null = supabase,
): Promise<Ocorrencia[]> {
  let consulta = exigirCliente(cliente)
    .from("ocorrencias")
    .select(camposPublicos)
    .order("criado_em", { ascending: false });

  if (filtros.titulo?.trim()) {
    consulta = consulta.ilike("titulo", `%${filtros.titulo.trim()}%`);
  }
  if (filtros.bairro?.trim()) {
    consulta = consulta.ilike("bairro", `%${filtros.bairro.trim()}%`);
  }
  if (filtros.categoria) {
    consulta = consulta.eq("categoria", filtros.categoria);
  }
  if (filtros.status) {
    consulta = consulta.eq("status", filtros.status);
  }

  const { data, error } = await consulta;
  if (error) {
    throw new Error("Não foi possível carregar as ocorrências.");
  }

  return (data as unknown as OcorrenciaBanco[]).map(converterOcorrencia);
}

export async function buscarOcorrenciaPorId(
  id: string,
  cliente: ClienteOcorrencias | null = supabase,
): Promise<Ocorrencia | null> {
  const { data, error } = await exigirCliente(cliente)
    .from("ocorrencias")
    .select(camposPublicos)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar os detalhes da ocorrência.");
  }
  return data ? converterOcorrencia(data as unknown as OcorrenciaBanco) : null;
}
