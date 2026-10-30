import { categoriasOcorrencia } from "../data/opcoesOcorrencia";
import type { CategoriaOcorrenciaBanco } from "../types/OcorrenciaBanco";

export type DadosCadastroOcorrencia = {
  titulo: string;
  descricao: string;
  categoria: CategoriaOcorrenciaBanco | "";
  bairro: string;
  nomePublico: string | null;
};

export type ErrosCadastroOcorrencia = Partial<
  Record<keyof DadosCadastroOcorrencia, string>
>;

export function validarCadastroOcorrencia(
  dados: DadosCadastroOcorrencia,
): ErrosCadastroOcorrencia {
  const erros: ErrosCadastroOcorrencia = {};
  const titulo = dados.titulo.trim();
  const descricao = dados.descricao.trim();
  const bairro = dados.bairro.trim();
  const nomePublico = dados.nomePublico?.trim() ?? "";

  if (titulo.length < 3) erros.titulo = "Informe um título com pelo menos 3 caracteres.";
  else if (titulo.length > 150) erros.titulo = "O título deve ter no máximo 150 caracteres.";

  if (descricao.length < 5) erros.descricao = "Informe uma descrição com pelo menos 5 caracteres.";
  else if (descricao.length > 3000) erros.descricao = "A descrição deve ter no máximo 3000 caracteres.";

  if (!dados.categoria || !categoriasOcorrencia.some(({ codigo }) => codigo === dados.categoria)) {
    erros.categoria = "Selecione uma categoria.";
  }

  if (bairro.length < 2) erros.bairro = "Informe um bairro com pelo menos 2 caracteres.";
  else if (bairro.length > 120) erros.bairro = "O bairro deve ter no máximo 120 caracteres.";

  if (dados.nomePublico !== null && nomePublico.length < 2) {
    erros.nomePublico = "O nome público deve ter pelo menos 2 caracteres.";
  } else if (nomePublico.length > 80) {
    erros.nomePublico = "O nome público deve ter no máximo 80 caracteres.";
  }

  return erros;
}
