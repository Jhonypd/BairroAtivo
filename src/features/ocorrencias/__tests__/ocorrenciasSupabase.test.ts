import { describe, expect, it, jest } from "@jest/globals";
import {
  converterOcorrencia,
  listarOcorrencias,
} from "../services/ocorrenciasSupabase";

describe("integração pública de ocorrências", () => {
  it("converte os campos públicos e os estados do banco", () => {
    expect(
      converterOcorrencia({
        id: "ocorrencia-1",
        titulo: "Buraco na rua",
        descricao: "Cratera na esquina da rua principal.",
        categoria: "buraco",
        bairro: "Centro",
        status: "em_acompanhamento",
        criado_em: "2026-10-28T15:00:00.000Z",
        nome_publico: null,
      }),
    ).toEqual({
      id: "ocorrencia-1",
      titulo: "Buraco na rua",
      descricao: "Cratera na esquina da rua principal.",
      categoria: "Buraco na via",
      bairro: "Centro",
      status: "Em acompanhamento",
      registradaEm: "28 de out. de 2026",
    });
  });

  it("exibe o nome do autor somente quando o campo público está preenchido", () => {
    const base = {
      id: "ocorrencia-1",
      titulo: "Buraco na rua",
      descricao: "Cratera na esquina da rua principal.",
      categoria: "buraco" as const,
      bairro: "Centro",
      status: "aberta" as const,
      criado_em: "2026-10-28T15:00:00.000Z",
    };

    expect(converterOcorrencia({ ...base, nome_publico: "  Ana  " }).nomeAutorPublico).toBe("Ana");
    expect(converterOcorrencia({ ...base, nome_publico: "  " }).nomeAutorPublico).toBeUndefined();
  });

  it("consulta somente os campos públicos e ordena do mais recente", async () => {
    const ordenar = jest.fn().mockResolvedValue({ data: [], error: null } as never);
    const selecionar = jest.fn().mockReturnValue({ order: ordenar });
    const tabela = jest.fn().mockReturnValue({ select: selecionar });
    const cliente = { from: tabela } as never;

    await listarOcorrencias({}, cliente);

    expect(tabela).toHaveBeenCalledWith("ocorrencias");
    expect(selecionar).toHaveBeenCalledWith(
      "id,titulo,descricao,categoria,bairro,status,criado_em,nome_publico",
    );
    expect(ordenar).toHaveBeenCalledWith("criado_em", { ascending: false });
  });

  it("mantém a listagem vazia sem falhar", async () => {
    const ordenar = jest.fn().mockResolvedValue({ data: [], error: null } as never);
    const selecionar = jest.fn().mockReturnValue({ order: ordenar });
    const tabela = jest.fn().mockReturnValue({ select: selecionar });

    await expect(listarOcorrencias({}, { from: tabela } as never)).resolves.toEqual([]);
  });

  it("rejeita a consulta quando o Supabase retorna erro", async () => {
    const ordenar = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "offline" },
    } as never);
    const selecionar = jest.fn().mockReturnValue({ order: ordenar });
    const tabela = jest.fn().mockReturnValue({ select: selecionar });

    await expect(
      listarOcorrencias({}, { from: tabela } as never),
    ).rejects.toThrow("Não foi possível carregar as ocorrências.");
  });

  it("aplica busca por título e filtros de bairro, categoria e status", async () => {
    const eq = jest.fn();
    eq.mockReturnThis();
    const ilike = jest.fn();
    ilike.mockReturnThis();
    const ordenar = jest.fn().mockReturnThis();
    const selecionar = jest.fn().mockReturnValue({ order: ordenar, ilike, eq });
    const tabela = jest.fn().mockReturnValue({ select: selecionar });
    const consulta = { ilike, eq, then: (resolve: (valor: unknown) => void) => resolve({ data: [], error: null }) };
    ordenar.mockReturnValue(consulta);
    ilike.mockReturnValue(consulta);
    eq.mockReturnValue(consulta);

    await listarOcorrencias({
      titulo: "  buraco  ",
      bairro: "Centro",
      categoria: "buraco",
      status: "aberta",
    }, { from: tabela } as never);

    expect(ilike).toHaveBeenNthCalledWith(1, "titulo", "%buraco%");
    expect(ilike).toHaveBeenNthCalledWith(2, "bairro", "%Centro%");
    expect(eq).toHaveBeenNthCalledWith(1, "categoria", "buraco");
    expect(eq).toHaveBeenNthCalledWith(2, "status", "aberta");
  });
});
