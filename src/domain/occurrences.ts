import type { Occurrence } from "../types/occurrence";

export const occurrences: Occurrence[] = [
  {
    id: "1",
    title: "Buraco na via",
    description: "Buraco grande na Rua das Flores, dificultando a passagem de veículos e pedestres.",
    category: "Infraestrutura",
    neighborhood: "Centro",
    status: "Aberta",
    reportedAt: "12 nov. 2024",
  },
  {
    id: "2",
    title: "Iluminação pública",
    description: "O poste da Rua da Trindade está apagado à noite, deixando o trecho pouco iluminado.",
    category: "Iluminação pública",
    neighborhood: "Trindade",
    status: "Em acompanhamento",
    reportedAt: "10 nov. 2024",
  },
  {
    id: "3",
    title: "Lixo em local indevido",
    description: "Há resíduos descartados junto à calçada, próximos ao acesso da praça do bairro.",
    category: "Lixo e limpeza",
    neighborhood: "Itacorubi",
    status: "Aberta",
    reportedAt: "8 nov. 2024",
  },
  {
    id: "4",
    title: "Árvore com risco de queda",
    description: "Uma árvore inclinada chama atenção de quem passa pela rua depois das chuvas.",
    category: "Meio ambiente",
    neighborhood: "Córrego Grande",
    status: "Resolvida",
    reportedAt: "5 nov. 2024",
  },
];
