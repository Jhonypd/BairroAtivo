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
  const caminhoDaImagem = dado.fotos_ocorrencias
    ?.slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map((foto) => foto.caminho_arquivo.trim())
    .find((caminho) => /^https:\/\//i.test(caminho));

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
    ...(caminhoDaImagem ? { imagemUrl: caminhoDaImagem } : {}),
    ...(typeof dado.latitude === "number" ? { latitude: dado.latitude } : {}),
    ...(typeof dado.longitude === "number" ? { longitude: dado.longitude } : {}),
    ...(typeof dado.total_apoios === "number" ? { totalApoios: dado.total_apoios } : {}),
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
const camposDetalhe = `${camposPublicos},latitude,longitude,total_apoios,fotos_ocorrencias(caminho_arquivo,ordem)`;

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
    .select(camposDetalhe)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar os detalhes da ocorrência.");
  }
  return data ? converterOcorrencia(data as unknown as OcorrenciaBanco) : null;
}

async function obterUsuarioApoio(cliente: ClienteOcorrencias) {
  const { data, error } = await cliente.auth.getUser();
  if (error) throw new Error("Não foi possível validar sua sessão. Tente novamente.");
  if (!data.user) throw new Error("Entre com Google para acompanhar esta ocorrência.");
  return data.user;
}

export async function buscarApoioOcorrencia(
  ocorrenciaId: string,
  cliente: ClienteOcorrencias | null = supabase,
): Promise<boolean> {
  const clienteConfigurado = exigirCliente(cliente);
  const usuario = await obterUsuarioApoio(clienteConfigurado);
  const { data, error } = await clienteConfigurado
    .from("apoios")
    .select("ocorrencia_id")
    .eq("ocorrencia_id", ocorrenciaId)
    .eq("usuario_id", usuario.id)
    .maybeSingle();

  if (error) throw new Error("Não foi possível verificar seu acompanhamento.");
  return Boolean(data);
}

export async function definirApoioOcorrencia(
  ocorrenciaId: string,
  apoiando: boolean,
  cliente: ClienteOcorrencias | null = supabase,
): Promise<void> {
  const clienteConfigurado = exigirCliente(cliente);
  const usuario = await obterUsuarioApoio(clienteConfigurado);

  if (apoiando) {
    const { error } = await clienteConfigurado
      .from("apoios")
      .insert({ ocorrencia_id: ocorrenciaId, usuario_id: usuario.id });

    // A chave composta do banco protege contra cliques duplicados ou concorrentes.
    if (error && error.code !== "23505") {
      throw new Error("Não foi possível acompanhar esta ocorrência. Tente novamente.");
    }
    return;
  }

  const { error } = await clienteConfigurado
    .from("apoios")
    .delete()
    .eq("ocorrencia_id", ocorrenciaId)
    .eq("usuario_id", usuario.id);

  if (error) throw new Error("Não foi possível retirar seu acompanhamento. Tente novamente.");
}

export async function listarMinhasOcorrencias(
  cliente: ClienteOcorrencias | null = supabase,
): Promise<Ocorrencia[]> {
  const clienteConfigurado = exigirCliente(cliente);
  const { data: sessao, error: erroSessao } = await clienteConfigurado.auth.getUser();
  if (erroSessao || !sessao.user) throw new Error("Faça login para consultar suas ocorrências.");

  // Diagnóstico temporário: não registrar sessão, tokens, credenciais ou dados da RPC.
  console.info("[PB13 diagnóstico] usuário autenticado", { usuarioId: sessao.user.id });
  const { data, error } = await clienteConfigurado.rpc("listar_minhas_ocorrencias");
  if (error) {
    console.error("[PB13 diagnóstico] erro na RPC listar_minhas_ocorrencias", {
      codigo: error.code ?? null,
      mensagem: error.message,
    });
    throw new Error("Não foi possível carregar suas ocorrências.");
  }
  return ((data ?? []) as unknown as OcorrenciaBanco[]).map(converterOcorrencia);
}

export async function atualizarOcorrencia(
  id: string,
  dados: DadosCadastroOcorrencia,
  cliente: ClienteOcorrencias | null = supabase,
): Promise<Ocorrencia> {
  const clienteConfigurado = exigirCliente(cliente);
  const { data: autenticacao, error: erroAutenticacao } = await clienteConfigurado.auth.getUser();
  if (erroAutenticacao || !autenticacao.user) throw new Error("Faça login para editar uma ocorrência.");

  const { data, error } = await clienteConfigurado.from("ocorrencias").update({
    titulo: dados.titulo.trim(),
    descricao: dados.descricao.trim(),
    categoria: dados.categoria,
    bairro: dados.bairro.trim(),
    nome_publico: dados.nomePublico?.trim() || null,
  }).eq("id", id).select(camposPublicos).single();

  if (error || !data) throw new Error("Não foi possível atualizar a ocorrência. Verifique sua conexão e suas permissões.");
  return converterOcorrencia(data as unknown as OcorrenciaBanco);
}

export async function excluirOcorrencia(
  id: string,
  cliente: ClienteOcorrencias | null = supabase,
): Promise<void> {
  const clienteConfigurado = exigirCliente(cliente);
  const { data: autenticacao, error: erroAutenticacao } = await clienteConfigurado.auth.getUser();
  if (erroAutenticacao || !autenticacao.user) throw new Error("Faça login para excluir uma ocorrência.");

  const { error, count } = await clienteConfigurado.from("ocorrencias").delete({ count: "exact" }).eq("id", id);
  if (error || count === null || count < 1) throw new Error("Não foi possível excluir a ocorrência. Verifique sua conexão e suas permissões.");
}
