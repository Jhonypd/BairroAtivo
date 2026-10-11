import type { Occurrence } from "../types/occurrence";

export const occurrences: Occurrence[] = [
  {
    id: "1",
    title: "Buraco na Rua das Flores",
    description:
      "Um buraco grande está próximo à faixa de pedestres e dificulta a passagem de carros e bicicletas.",
    category: "Vias públicas",
    neighborhood: "Fazenda",
    status: "Em acompanhamento",
  },
  {
    id: "2",
    title: "Lâmpada queimada na praça",
    description:
      "A iluminação do poste ao lado da quadra está apagada durante a noite.",
    category: "Iluminação",
    neighborhood: "Centro",
    status: "Aberta",
  },
  {
    id: "3",
    title: "Descarte irregular de resíduos",
    description:
      "Há sacos e móveis descartados na calçada da Rua do Ipê.",
    category: "Limpeza urbana",
    neighborhood: "São Vicente",
    status: "Resolvida",
  },
];
