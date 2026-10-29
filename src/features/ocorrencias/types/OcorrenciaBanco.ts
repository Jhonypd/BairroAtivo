export type StatusOcorrenciaBanco =
  | "aberta"
  | "em_acompanhamento"
  | "resolvida";

export type CategoriaOcorrenciaBanco =
  | "buraco"
  | "calcada"
  | "iluminacao"
  | "lixo"
  | "outro";

export type OcorrenciaBanco = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaOcorrenciaBanco;
  bairro: string;
  status: StatusOcorrenciaBanco;
  criado_em: string;
  nome_publico: string | null;
};
