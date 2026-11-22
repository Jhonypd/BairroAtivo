export type StatusOcorrencia = "Aberta" | "Em acompanhamento" | "Resolvida";

export type Ocorrencia = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  bairro: string;
  status: StatusOcorrencia;
  registradaEm: string;
  nomeAutorPublico?: string;
  imagemUrl?: string | null;
  imagensUrl?: string[];
  latitude?: number;
  longitude?: number;
  totalApoios?: number;
};






