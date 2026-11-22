import { describe, expect, it, jest } from "@jest/globals";
import {
  cadastrarOcorrencia,
  buscarOcorrenciaPorId,
  converterOcorrencia,
  listarOcorrencias,
  validarFotosOcorrencia,
} from "../services/ocorrenciasSupabase";

describe("integração pública de ocorrências", () => {
  it("valida tipo e tamanho das fotos antes do envio", () => {
    expect(validarFotosOcorrencia([{ uri: "file:///foto.jpg", mimeType: "image/jpeg", fileSize: 1024, fileName: "foto.jpg" }])).toBeNull();
    expect(validarFotosOcorrencia([{ uri: "file:///arquivo.gif", mimeType: "image/gif", fileSize: 1024, fileName: "arquivo.gif" }])).toContain("JPG, PNG ou WebP");
    expect(validarFotosOcorrencia([{ uri: "file:///foto.jpg", mimeType: "image/jpeg", fileSize: 6 * 1024 * 1024, fileName: "foto.jpg" }])).toContain("até 5 MB");
  });

  it("vincula cada arquivo ao id da ocorrência ao inserir os metadados", async () => {
    const dadosOcorrencia = {
      id: "ocorrencia-1",
      titulo: "Buraco na rua",
      descricao: "Cratera na esquina da rua principal.",
      categoria: "buraco" as const,
      bairro: "Centro",
      status: "aberta" as const,
      criado_em: "2026-10-28T15:00:00.000Z",
      nome_publico: null,
    };
    const inserirFoto = jest.fn(async (_linhas: { ocorrencia_id: string; caminho_arquivo: string; ordem: number }[]) => ({ error: null }));
    const ordemFotos = jest.fn(async (_campo: string, _opcoes: { ascending: boolean }) => ({ data: [], error: null }));
    const filtrarFotos = jest.fn(() => ({ order: ordemFotos }));
    const buscarOrdemFotos = jest.fn(() => ({ eq: filtrarFotos }));
    const inserirOcorrencia = jest.fn(() => ({
      select: jest.fn(() => ({ single: jest.fn(async () => ({ data: dadosOcorrencia, error: null })) })),
    }));
    const cliente = {
      auth: { getUser: jest.fn(async () => ({ data: { user: { id: "usuario-1" } }, error: null })) },
      from: jest.fn((tabela: string) => tabela === "ocorrencias"
        ? { insert: inserirOcorrencia }
        : { select: buscarOrdemFotos, insert: inserirFoto }),
      storage: { from: jest.fn(() => ({ upload: jest.fn(async () => ({ error: null })) })) },
    } as never;
    const buscarArquivo = jest.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(4),
    } as Response);

    try {
      await cadastrarOcorrencia(
        { titulo: "Buraco na rua", descricao: "Cratera na esquina da rua principal.", categoria: "buraco", bairro: "Centro", nomePublico: null },
        cliente,
        [{ uri: "file:///foto.jpg", mimeType: "image/jpeg", fileSize: 1024, fileName: "foto.jpg" }],
      );
    } finally {
      buscarArquivo.mockRestore();
    }

    expect(inserirFoto).toHaveBeenCalledWith([
      expect.objectContaining({ ocorrencia_id: "ocorrencia-1", ordem: 0 }),
    ]);
  });

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
      "id,titulo,descricao,categoria,bairro,status,criado_em,nome_publico,total_apoios,cidade_ibge,latitude,longitude,fotos_ocorrencias(caminho_arquivo,ordem)",
    );
    expect(ordenar).toHaveBeenCalledWith("criado_em", { ascending: false });
  });

  it("recupera a listagem sem filtro de cidade quando o banco ainda não tem a migration", async () => {
    const consultaComCidade = { eq: jest.fn().mockReturnThis(), order: jest.fn(), then: (resolve: (valor: unknown) => void) => resolve({ data: null, error: { code: "42703", message: "column ocorrencias.cidade_ibge does not exist" } }) };
    consultaComCidade.order.mockReturnValue(consultaComCidade as never);
    const consultaLegada = { order: jest.fn(), then: (resolve: (valor: unknown) => void) => resolve({ data: [], error: null }) };
    consultaLegada.order.mockReturnValue(consultaLegada as never);
    const selecionar = jest.fn().mockReturnValueOnce(consultaComCidade).mockReturnValueOnce(consultaLegada);
    const tabela = jest.fn().mockReturnValue({ select: selecionar });

    await expect(listarOcorrencias({ cidadeIbge: 4202909 }, { from: tabela } as never)).resolves.toEqual([]);

    expect(selecionar).toHaveBeenNthCalledWith(2, "id,titulo,descricao,categoria,bairro,status,criado_em,nome_publico,total_apoios,latitude,longitude,fotos_ocorrencias(caminho_arquivo,ordem)");
    expect(consultaComCidade.eq).toHaveBeenCalledWith("cidade_ibge", 4202909);
  });

  it("recupera os detalhes sem o campo de cidade no schema atual", async () => {
    const linhaLegada = {
      id: "ocorrencia-1", titulo: "Buraco na rua", descricao: "Cratera na esquina da rua principal.",
      categoria: "buraco", bairro: "Centro", status: "aberta", criado_em: "2026-10-28T15:00:00.000Z", nome_publico: null,
    };
    const consultaAtual = { eq: jest.fn().mockReturnThis(), maybeSingle: jest.fn().mockResolvedValue({ data: null, error: { code: "42703", message: "column ocorrencias.cidade_ibge does not exist" } } as never) };
    const consultaLegada = { eq: jest.fn().mockReturnThis(), maybeSingle: jest.fn().mockResolvedValue({ data: linhaLegada, error: null } as never) };
    const selecionar = jest.fn().mockReturnValueOnce(consultaAtual).mockReturnValueOnce(consultaLegada);
    const tabela = jest.fn().mockReturnValue({ select: selecionar });

    await expect(buscarOcorrenciaPorId("ocorrencia-1", { from: tabela } as never)).resolves.toMatchObject({ id: "ocorrencia-1", titulo: "Buraco na rua" });
    expect(selecionar).toHaveBeenNthCalledWith(2, "id,titulo,descricao,categoria,bairro,status,criado_em,nome_publico,total_apoios,latitude,longitude,fotos_ocorrencias(caminho_arquivo,ordem)");
  });

  it("assina a primeira foto vinculada para exibição no cartão da listagem", async () => {
    const caminhoPrimeira = "ocorrencia-1/primeira.jpg";
    const ordenar = jest.fn().mockResolvedValue({
      data: [{
        id: "ocorrencia-1",
        titulo: "Buraco na rua",
        descricao: "Cratera na esquina da rua principal.",
        categoria: "buraco",
        bairro: "Centro",
        status: "aberta",
        criado_em: "2026-10-28T15:00:00.000Z",
        nome_publico: null,
        fotos_ocorrencias: [
          { caminho_arquivo: caminhoPrimeira, ordem: 0 },
          { caminho_arquivo: "ocorrencia-1/segunda.jpg", ordem: 1 },
        ],
      }],
      error: null,
    } as never);
    const selecionar = jest.fn().mockReturnValue({ order: ordenar });
    const tabela = jest.fn().mockReturnValue({ select: selecionar });
    const assinar = jest.fn().mockResolvedValue({
      data: [{ path: caminhoPrimeira, signedUrl: "https://exemplo.invalid/primeira-assinada.jpg" }],
      error: null,
    } as never);
    const cliente = {
      from: tabela,
      storage: { from: jest.fn(() => ({ createSignedUrls: assinar })) },
    } as never;

    const resultado = await listarOcorrencias({}, cliente);

    expect(assinar).toHaveBeenCalledWith([caminhoPrimeira], 3600);
    expect(resultado[0]?.imagemUrl).toBe("https://exemplo.invalid/primeira-assinada.jpg");
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
