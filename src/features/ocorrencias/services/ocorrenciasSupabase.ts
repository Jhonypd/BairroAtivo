import { supabase } from "@/configs/supabase";
import type { ImagePickerAsset } from "expo-image-picker";
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
  "id,titulo,descricao,categoria,bairro,status,criado_em,nome_publico,total_apoios";
const camposLista = `${camposPublicos},fotos_ocorrencias(caminho_arquivo,ordem)`;
const camposDetalhe = `${camposPublicos},latitude,longitude,fotos_ocorrencias(caminho_arquivo,ordem)`;
const bucketFotos = "fotos-ocorrencias";
const limiteFotosPorEnvio = 5;
const limiteTamanhoFoto = 5 * 1024 * 1024;

async function adicionarPrimeirasFotosAssinadas(
  registros: OcorrenciaBanco[],
  cliente: ClienteOcorrencias,
): Promise<Ocorrencia[]> {
  const primeirasFotos = registros.map((registro) =>
    registro.fotos_ocorrencias?.slice().sort((a, b) => a.ordem - b.ordem)[0]?.caminho_arquivo.trim(),
  );
  const caminhosPrivados = primeirasFotos
    .filter((caminho): caminho is string => Boolean(caminho && !/^https:\/\//i.test(caminho)));
  const urlsPorCaminho = new Map<string, string>();

  if (caminhosPrivados.length > 0) {
    const { data, error } = await cliente.storage.from(bucketFotos).createSignedUrls(caminhosPrivados, 3600);
    if (error) throw new Error("Não foi possível carregar as fotos das ocorrências.");
    for (const arquivo of data) {
      if (arquivo.path && arquivo.signedUrl) urlsPorCaminho.set(arquivo.path, arquivo.signedUrl);
    }
  }

  return registros.map((registro, indice) => {
    const ocorrencia = converterOcorrencia(registro);
    const caminho = primeirasFotos[indice];
    const imagemUrl = caminho
      ? /^https:\/\//i.test(caminho) ? caminho : urlsPorCaminho.get(caminho)
      : undefined;
    return imagemUrl ? { ...ocorrencia, imagemUrl } : ocorrencia;
  });
}

export type FotoOcorrenciaSelecionada = Pick<ImagePickerAsset, "uri" | "mimeType" | "fileSize" | "fileName">;

export function validarFotosOcorrencia(fotos: FotoOcorrenciaSelecionada[]): string | null {
  if (fotos.length > limiteFotosPorEnvio) return "Você pode anexar até 5 fotos por vez.";
  const mimePermitidos = new Set(["image/jpeg", "image/png", "image/webp"]);
  for (const foto of fotos) {
    const extensao = foto.fileName?.split(".").pop()?.toLowerCase();
    const mime = foto.mimeType ?? (extensao === "png" ? "image/png" : extensao === "webp" ? "image/webp" : extensao === "jpg" || extensao === "jpeg" ? "image/jpeg" : null);
    if (!mime || !mimePermitidos.has(mime)) return "Use imagens nos formatos JPG, PNG ou WebP.";
    if (typeof foto.fileSize !== "number" || foto.fileSize <= 0 || foto.fileSize > limiteTamanhoFoto) {
      return "Cada foto deve ter até 5 MB e tamanho identificável.";
    }
  }
  return null;
}

function extensaoFoto(foto: FotoOcorrenciaSelecionada): string {
  const mime = foto.mimeType ?? (foto.fileName?.toLowerCase().endsWith(".png") ? "image/png" : foto.fileName?.toLowerCase().endsWith(".webp") ? "image/webp" : "image/jpeg");
  return mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
}

async function enviarFotosOcorrencia(
  ocorrenciaId: string,
  fotos: FotoOcorrenciaSelecionada[],
  cliente: ClienteOcorrencias,
): Promise<void> {
  if (fotos.length === 0) return;
  const validacao = validarFotosOcorrencia(fotos);
  if (validacao) throw new Error(validacao);
  const { data: existentes, error: erroConsulta } = await cliente
    .from("fotos_ocorrencias").select("ordem").eq("ocorrencia_id", ocorrenciaId).order("ordem", { ascending: true });
  if (erroConsulta) throw new Error("Não foi possível preparar as fotos da ocorrência.");
  const caminhosEnviados: string[] = [];
  try {
    const caminhos: { ocorrencia_id: string; caminho_arquivo: string; ordem: number }[] = [];
    for (const [indice, foto] of fotos.entries()) {
      const resposta = await fetch(foto.uri);
      if (!resposta.ok) throw new Error("Não foi possível ler uma das fotos selecionadas.");
      const conteudo = await resposta.arrayBuffer();
      const extensao = extensaoFoto(foto);
      const caminho = `${ocorrenciaId}/${Date.now()}-${indice}-${Math.random().toString(36).slice(2)}.${extensao}`;
      const mimeType = foto.mimeType ?? (extensao === "png" ? "image/png" : extensao === "webp" ? "image/webp" : "image/jpeg");
      const { error } = await cliente.storage.from(bucketFotos).upload(caminho, conteudo, { contentType: mimeType, upsert: false });
      if (error) throw new Error("Não foi possível enviar uma das fotos. Tente novamente.");
      caminhosEnviados.push(caminho);
      caminhos.push({
        ocorrencia_id: ocorrenciaId,
        caminho_arquivo: caminho,
        ordem: (existentes?.length ?? 0) + indice,
      });
    }
    const { error } = await cliente.from("fotos_ocorrencias").insert(caminhos);
    if (error) throw new Error("As fotos foram enviadas, mas não puderam ser vinculadas à ocorrência.");
  } catch (erro) {
    if (caminhosEnviados.length > 0) {
      const { error } = await cliente.storage.from(bucketFotos).remove(caminhosEnviados);
      if (error) console.error("Não foi possível limpar arquivos após falha no vínculo das fotos.", error.message);
    }
    throw erro;
  }
}

async function adicionarUrlsAssinadas(ocorrencia: Ocorrencia, dado: OcorrenciaBanco, cliente: ClienteOcorrencias): Promise<Ocorrencia> {
  const arquivos = dado.fotos_ocorrencias?.slice().sort((a, b) => a.ordem - b.ordem).map((foto) => foto.caminho_arquivo.trim()) ?? [];
  const urlsLegadas = arquivos.filter((caminho) => /^https:\/\//i.test(caminho));
  const caminhos = arquivos.filter((caminho) => !/^https:\/\//i.test(caminho));
  if (caminhos.length === 0) return ocorrencia;
  const { data, error } = await cliente.storage.from(bucketFotos).createSignedUrls(caminhos, 3600);
  if (error) throw new Error("Não foi possível carregar as fotos desta ocorrência.");
  const urls = [...urlsLegadas, ...data.map((arquivo) => arquivo.signedUrl).filter((url): url is string => Boolean(url))];
  return { ...ocorrencia, imagensUrl: urls, ...(urls[0] ? { imagemUrl: urls[0] } : {}) };
}

export async function cadastrarOcorrencia(
  dados: DadosCadastroOcorrencia,
  cliente: ClienteOcorrencias | null = supabase,
  fotos: FotoOcorrenciaSelecionada[] = [],
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

  const ocorrencia = converterOcorrencia(data as unknown as OcorrenciaBanco);
  try {
    await enviarFotosOcorrencia(ocorrencia.id, fotos, clienteConfigurado);
  } catch (erro) {
    const { error: erroAoDesfazer } = await clienteConfigurado.from("ocorrencias").delete().eq("id", ocorrencia.id);
    if (erroAoDesfazer) {
      throw new Error("A ocorrência foi cadastrada, mas as fotos falharam e não foi possível desfazer o cadastro. Edite a ocorrência para tentar novamente.");
    }
    throw erro;
  }
  return ocorrencia;
}

export async function listarOcorrencias(
  filtros: FiltrosOcorrencia = {},
  cliente: ClienteOcorrencias | null = supabase,
): Promise<Ocorrencia[]> {
  let consulta = exigirCliente(cliente)
    .from("ocorrencias")
    .select(camposLista)
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

  return adicionarPrimeirasFotosAssinadas(data as unknown as OcorrenciaBanco[], exigirCliente(cliente));
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
  if (!data) return null;
  const registro = data as unknown as OcorrenciaBanco;
  return adicionarUrlsAssinadas(converterOcorrencia(registro), registro, exigirCliente(cliente));
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
  fotos: FotoOcorrenciaSelecionada[] = [],
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
  if (fotos.length === 0) return converterOcorrencia(data as unknown as OcorrenciaBanco);
  await enviarFotosOcorrencia(id, fotos, clienteConfigurado);
  return await buscarOcorrenciaPorId(id, clienteConfigurado) ?? converterOcorrencia(data as unknown as OcorrenciaBanco);
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
