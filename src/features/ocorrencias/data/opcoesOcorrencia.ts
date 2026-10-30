import type { CategoriaOcorrenciaBanco } from "../types/OcorrenciaBanco";

export const categoriasOcorrencia = [
  { codigo: "buraco", rotulo: "Buraco na via" },
  { codigo: "calcada", rotulo: "Calçada danificada" },
  { codigo: "iluminacao", rotulo: "Iluminação pública" },
  { codigo: "lixo", rotulo: "Descarte irregular de lixo" },
  { codigo: "outro", rotulo: "Outro problema" },
] as const satisfies readonly { codigo: CategoriaOcorrenciaBanco; rotulo: string }[];

export function categoriaBancoPorRotulo(rotulo: string): CategoriaOcorrenciaBanco | null {
  return categoriasOcorrencia.find((categoria) => categoria.rotulo === rotulo)?.codigo ?? null;
}

export function rotuloCategoriaBanco(codigo: CategoriaOcorrenciaBanco): string {
  const categoria = categoriasOcorrencia.find((opcao) => opcao.codigo === codigo);
  if (!categoria) throw new Error("Categoria de ocorrência desconhecida.");
  return categoria.rotulo;
}

export const bairros = [
  "Centro",
  "Trindade",
  "Itacorubi",
  "Córrego Grande",
  "Saco dos Limões",
  "Santa Mônica",
  "Outros",
] as const;
