import { describe, expect, it, jest } from "@jest/globals";
import {
  categoriaBancoPorRotulo,
  categoriasOcorrencia,
} from "../data/opcoesOcorrencia";
import {
  validarCadastroOcorrencia,
  type DadosCadastroOcorrencia,
} from "../validacoes/cadastroOcorrencia";
import { cadastrarOcorrencia } from "../services/ocorrenciasSupabase";

const dadosValidos: DadosCadastroOcorrencia = {
  titulo: "Buraco na rua principal",
  descricao: "Há uma cratera grande perto da praça.",
  categoria: "buraco",
  bairro: "Centro",
  nomePublico: null,
};

describe("validação de cadastro de ocorrência", () => {
  it("exige título, descrição, categoria e bairro", () => {
    expect(validarCadastroOcorrencia({
      titulo: "",
      descricao: "",
      categoria: "",
      bairro: "",
      nomePublico: null,
    })).toEqual(expect.objectContaining({
      titulo: expect.any(String),
      descricao: expect.any(String),
      categoria: expect.any(String),
      bairro: expect.any(String),
    }));
  });

  it("aplica limites e aceita os tamanhos permitidos", () => {
    expect(validarCadastroOcorrencia({
      ...dadosValidos,
      titulo: "T".repeat(150),
      descricao: "D".repeat(3000),
      bairro: "B".repeat(120),
      nomePublico: "N".repeat(80),
    })).toEqual({});

    expect(validarCadastroOcorrencia({
      ...dadosValidos,
      titulo: "T".repeat(151),
      descricao: "D".repeat(3001),
      bairro: "B".repeat(121),
      nomePublico: "N".repeat(81),
    })).toEqual(expect.objectContaining({
      titulo: expect.any(String),
      descricao: expect.any(String),
      bairro: expect.any(String),
      nomePublico: expect.any(String),
    }));
  });

  it("rejeita os mínimos definidos no banco após remover espaços", () => {
    expect(validarCadastroOcorrencia({
      ...dadosValidos,
      titulo: " A ",
      descricao: "abcd",
      bairro: "B",
      nomePublico: "A",
    })).toEqual(expect.objectContaining({
      titulo: expect.any(String),
      descricao: expect.any(String),
      bairro: expect.any(String),
      nomePublico: expect.any(String),
    }));
  });
});

describe("categorias do cadastro", () => {
  it.each([
    ["Buraco na via", "buraco"],
    ["Calçada danificada", "calcada"],
    ["Iluminação pública", "iluminacao"],
    ["Descarte irregular de lixo", "lixo"],
    ["Outro problema", "outro"],
  ] as const)("mapeia %s para o código do banco", (rotulo, codigo) => {
    expect(categoriaBancoPorRotulo(rotulo)).toBe(codigo);
  });

  it("não oferece rótulos incompatíveis com o banco", () => {
    expect(categoriasOcorrencia.map(({ rotulo }) => rotulo)).not.toContain("Infraestrutura");
    expect(categoriaBancoPorRotulo("Infraestrutura")).toBeNull();
  });
});

describe("cadastro no Supabase", () => {
  function criarClienteTeste(resposta: {
    data: unknown;
    error: unknown;
  }, usuarioId: string | null = "usuario-auth-1", erroUsuario: unknown = null) {
    const single = jest.fn().mockResolvedValue(resposta as never);
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const from = jest.fn().mockReturnValue({ insert });
    const getUser = jest.fn().mockResolvedValue({
      data: { user: usuarioId ? { id: usuarioId } : null },
      error: erroUsuario,
    } as never);
    return { cliente: { auth: { getUser }, from } as never, from, insert, select, single, getUser };
  }

  it("associa o usuário autenticado e retorna somente colunas públicas", async () => {
    const linha = {
      id: "ocorrencia-nova",
      titulo: dadosValidos.titulo,
      descricao: dadosValidos.descricao,
      categoria: "buraco",
      bairro: dadosValidos.bairro,
      status: "aberta",
      criado_em: "2026-10-30T10:00:00.000Z",
      nome_publico: null,
    };
    const cliente = criarClienteTeste({ data: linha, error: null });

    await expect(cadastrarOcorrencia(dadosValidos, cliente.cliente)).resolves.toEqual(
      expect.objectContaining({ id: "ocorrencia-nova", categoria: "Buraco na via" }),
    );

    expect(cliente.getUser).toHaveBeenCalled();
    expect(cliente.from).toHaveBeenCalledWith("ocorrencias");
    expect(cliente.insert).toHaveBeenCalledWith({
      titulo: dadosValidos.titulo,
      descricao: dadosValidos.descricao,
      categoria: "buraco",
      bairro: dadosValidos.bairro,
      autor_id: "usuario-auth-1",
      nome_publico: null,
    });
    expect(cliente.select).toHaveBeenCalledWith(
      "id,titulo,descricao,categoria,bairro,status,criado_em,nome_publico",
    );
  });

  it("não tenta inserir sem uma sessão autenticada", async () => {
    const cliente = criarClienteTeste({ data: null, error: null }, null);
    await expect(cadastrarOcorrencia(dadosValidos, cliente.cliente)).rejects.toThrow(/login/i);
    expect(cliente.from).not.toHaveBeenCalled();
  });

  it("informa falha ao validar a sessão sem tentar inserir", async () => {
    const cliente = criarClienteTeste({ data: null, error: null }, null, { message: "offline" });
    await expect(cadastrarOcorrencia(dadosValidos, cliente.cliente)).rejects.toThrow(
      "Não foi possível validar sua sessão. Verifique a conexão e tente novamente.",
    );
    expect(cliente.from).not.toHaveBeenCalled();
  });

  it("retorna erro claro quando o Supabase falha", async () => {
    const cliente = criarClienteTeste({ data: null, error: { message: "offline" } });
    await expect(cadastrarOcorrencia(dadosValidos, cliente.cliente)).rejects.toThrow(
      "Não foi possível cadastrar a ocorrência. Tente novamente.",
    );
  });

  it("falha quando a conexão não está configurada", async () => {
    await expect(cadastrarOcorrencia(dadosValidos, null)).rejects.toThrow(
      "A conexão com o Supabase não está configurada.",
    );
  });
});
