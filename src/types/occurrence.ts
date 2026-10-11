export type OccurrenceStatus = "Aberta" | "Em acompanhamento" | "Resolvida";

export type Occurrence = {
  id: string;
  title: string;
  description: string;
  category: string;
  neighborhood: string;
  status: OccurrenceStatus;
};
