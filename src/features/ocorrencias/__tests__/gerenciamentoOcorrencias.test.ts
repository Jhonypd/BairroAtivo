import { describe, expect, it, jest } from "@jest/globals";
import { atualizarOcorrencia, excluirOcorrencia, listarMinhasOcorrencias } from "../services/ocorrenciasSupabase";
import type { DadosCadastroOcorrencia } from "../validacoes/cadastroOcorrencia";

const dados: DadosCadastroOcorrencia = { titulo: "Buraco atualizado", descricao: "Cratera na via central.", categoria: "buraco", bairro: "Centro", nomePublico: null };
const linha = { id: "1", titulo: dados.titulo, descricao: dados.descricao, categoria: "buraco", bairro: "Centro", status: "aberta", criado_em: "2026-10-30T10:00:00Z", nome_publico: null };

describe("gerenciamento Supabase de ocorrências", () => {
  it("consulta a função RPC com a sessão autenticada e sem receber ID de usuário", async () => {
    const rpc = jest.fn(async () => ({ data: [linha], error: null }));
    const cliente = { auth: { getUser: jest.fn(async () => ({ data: { user: { id: "autor-1" } }, error: null })) }, rpc } as never;
    await expect(listarMinhasOcorrencias(cliente)).resolves.toHaveLength(1);
    expect(rpc.mock.calls[0]).toEqual(["listar_minhas_ocorrencias"]);
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("envia somente os campos editáveis e devolve os dados salvos", async () => {
    const single = jest.fn(async () => ({ data: linha, error: null }));
    const select = jest.fn().mockReturnValue({ single });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    const cliente = { auth: { getUser: jest.fn(async () => ({ data: { user: { id: "autor-1" } }, error: null })) }, from: jest.fn().mockReturnValue({ update }) } as never;
    await expect(atualizarOcorrencia("1", dados, cliente)).resolves.toMatchObject({ titulo: dados.titulo });
    expect(update).toHaveBeenCalledWith({ titulo: "Buraco atualizado", descricao: "Cratera na via central.", categoria: "buraco", bairro: "Centro", nome_publico: null });
    expect(eq.mock.calls[0]).toEqual(["id", "1"]);
  });

  it("preserva o erro de permissão/atualização como falha e nunca confirma sucesso", async () => {
    const single = jest.fn(async () => ({ data: null, error: { code: "42501" } }));
    const select = jest.fn().mockReturnValue({ single });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    const cliente = { auth: { getUser: jest.fn(async () => ({ data: { user: { id: "outro-autor" } }, error: null })) }, from: jest.fn().mockReturnValue({ update }) } as never;
    await expect(atualizarOcorrencia("1", dados, cliente)).rejects.toThrow("Não foi possível atualizar");
  });

  it("envia exclusão ao banco sem apagar relacionamentos manualmente", async () => {
    const eq = jest.fn(async () => ({ error: null, count: 1 }));
    const excluir = jest.fn().mockReturnValue({ eq });
    const cliente = { auth: { getUser: jest.fn(async () => ({ data: { user: { id: "autor-1" } }, error: null })) }, from: jest.fn().mockReturnValue({ delete: excluir }) } as never;
    await expect(excluirOcorrencia("1", cliente)).resolves.toBeUndefined();
    expect(excluir.mock.calls[0]).toEqual([{ count: "exact" }]);
    expect(eq.mock.calls[0]).toEqual(["id", "1"]);
  });

  it.each([null, 0])("não considera a exclusão bem-sucedida quando o banco retorna count=%s", async (count) => {
    const eq = jest.fn(async () => ({ error: null, count }));
    const excluir = jest.fn().mockReturnValue({ eq });
    const cliente = { auth: { getUser: jest.fn(async () => ({ data: { user: { id: "outro-usuario" } }, error: null })) }, from: jest.fn().mockReturnValue({ delete: excluir }) } as never;
    await expect(excluirOcorrencia("1", cliente)).rejects.toThrow("Não foi possível excluir");
  });
});
