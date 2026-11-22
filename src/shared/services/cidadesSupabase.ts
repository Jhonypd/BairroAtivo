import { supabase } from "@/configs/supabase";

export type Cidade = { codigoIbge: number; nome: string; uf: string };
type ClienteCidades = NonNullable<typeof supabase>;
const codigoBrusque = 4202909;

export function ehSchemaCidadeIndisponivel(erro: unknown): boolean {
  const visitados = new Set<unknown>();
  let atual = erro;
  while (atual && !visitados.has(atual)) {
    visitados.add(atual);
    if (typeof atual !== "object") return false;
    const detalhe = atual as { code?: unknown; message?: unknown; cause?: unknown; originalError?: unknown };
    const codigo = typeof detalhe.code === "string" ? detalhe.code : "";
    const mensagem = typeof detalhe.message === "string" ? detalhe.message.toLocaleLowerCase("pt-BR") : "";
    if (["42703", "42P01", "PGRST204", "PGRST205"].includes(codigo) && /(cidade_ibge|cidades|bairros)/.test(mensagem)) return true;
    atual = detalhe.cause ?? detalhe.originalError;
  }
  return false;
}

function erroDeConsulta(mensagem: string, erro: unknown): Error {
  return Object.assign(new Error(mensagem), { originalError: erro });
}

function exigirCliente(cliente: ClienteCidades | null): ClienteCidades {
  if (!cliente) throw new Error("A conexão com o Supabase não está configurada.");
  return cliente;
}

function converterCidade(dado: { codigo_ibge: number; nome: string; uf: string }): Cidade {
  return { codigoIbge: Number(dado.codigo_ibge), nome: dado.nome, uf: dado.uf.trim() };
}

export async function listarCidadesDisponiveis(cliente: ClienteCidades | null = supabase): Promise<Cidade[]> {
  const { data, error } = await exigirCliente(cliente).from("cidades").select("codigo_ibge,nome,uf").eq("ativa", true).order("nome");
  if (error) throw erroDeConsulta("Não foi possível carregar as cidades disponíveis.", error);
  return (data ?? []).map(converterCidade);
}

export async function obterCidadePorCodigo(codigoIbge: number, cliente: ClienteCidades | null = supabase): Promise<Cidade | null> {
  const { data, error } = await exigirCliente(cliente).from("cidades").select("codigo_ibge,nome,uf").eq("codigo_ibge", codigoIbge).maybeSingle();
  if (error) throw erroDeConsulta("Não foi possível carregar a cidade vinculada ao perfil.", error);
  return data ? converterCidade(data) : null;
}

export async function buscarCidadeDoUsuario(usuarioId: string, cliente: ClienteCidades | null = supabase): Promise<Cidade | null> {
  const { data, error } = await exigirCliente(cliente).from("perfis").select("cidade_ibge").eq("id", usuarioId).maybeSingle();
  if (error) throw erroDeConsulta("Não foi possível consultar a cidade do seu perfil.", error);
  return typeof data?.cidade_ibge === "number" ? obterCidadePorCodigo(data.cidade_ibge, cliente) : null;
}

export async function definirCidadeDoUsuario(usuarioId: string, codigoIbge: number, cliente: ClienteCidades | null = supabase): Promise<Cidade> {
  const clienteConfigurado = exigirCliente(cliente);
  const cidade = await obterCidadePorCodigo(codigoIbge, clienteConfigurado);
  if (!cidade) throw new Error("Selecione uma cidade disponível.");
  const { data: perfil, error: erroPerfil } = await clienteConfigurado.from("perfis").select("id").eq("id", usuarioId).maybeSingle();
  if (erroPerfil) throw new Error("Não foi possível preparar seu perfil.");
  const resposta = perfil
    ? await clienteConfigurado.from("perfis").update({ cidade_ibge: codigoIbge }).eq("id", usuarioId).select("id").single()
    : await clienteConfigurado.from("perfis").insert({ id: usuarioId, cidade_ibge: codigoIbge }).select("id").single();
  if (resposta.error || !resposta.data) throw new Error("Não foi possível vincular seu perfil à cidade selecionada.");
  return cidade;
}

export async function listarBairrosDaCidade(codigoIbge: number, cliente: ClienteCidades | null = supabase): Promise<string[]> {
  const { data, error } = await exigirCliente(cliente).from("bairros").select("nome").eq("cidade_ibge", codigoIbge).order("nome");
  if (error) throw new Error("Não foi possível carregar os bairros desta cidade.");
  return (data ?? []).map(({ nome }) => nome);
}

export async function sugerirBairro(usuarioId: string, codigoIbge: number, nome: string, cliente: ClienteCidades | null = supabase): Promise<void> {
  const { error } = await exigirCliente(cliente).from("sugestoes_bairros").insert({ usuario_id: usuarioId, cidade_ibge: codigoIbge, nome: nome.trim() });
  if (error) throw new Error("A ocorrência foi registrada, mas não foi possível enviar a sugestão de bairro.");
}

export async function obterCidadePublicaPadrao(cliente: ClienteCidades | null = supabase): Promise<Cidade> {
  const { data, error } = await exigirCliente(cliente).from("cidades").select("codigo_ibge,nome,uf").eq("codigo_ibge", codigoBrusque).eq("ativa", true).single();
  if (error) throw erroDeConsulta("Não foi possível carregar a cidade inicial do BairroAtivo.", error);
  if (!data) throw new Error("Não foi possível carregar a cidade inicial do BairroAtivo.");
  return converterCidade(data);
}
