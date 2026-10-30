import { render, screen, waitFor } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { router } from "expo-router";
import type { Session } from "@supabase/supabase-js";
import { CallbackAutenticacao } from "../views/CallbackAutenticacao";
import { concluirLoginComCodigo } from "../services/autenticacao";

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
jest.mock("../services/autenticacao", () => ({ concluirLoginComCodigo: jest.fn() }));

const mockConcluir = jest.mocked(concluirLoginComCodigo);
const mockReplace = jest.mocked(router.replace);

describe("CallbackAutenticacao", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("mostra carregamento enquanto conclui a troca do código", async () => {
    let concluir!: (sessao: Session) => void;
    mockConcluir.mockReturnValue(new Promise<Session>((resolve) => { concluir = resolve; }));

    await render(<CallbackAutenticacao codigo="codigo-google" />);
    expect(screen.getByLabelText("Concluindo login")).toBeTruthy();
    await waitFor(() => expect(mockConcluir).toHaveBeenCalledWith("codigo-google"));
    concluir({ user: { id: "usuario-1" } } as Session);
  });

  it("redireciona para o início quando a sessão é criada", async () => {
    mockConcluir.mockResolvedValue({} as Awaited<ReturnType<typeof concluirLoginComCodigo>>);
    await render(<CallbackAutenticacao codigo="codigo-google" />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/inicio"));
  });

  it("exibe erro retornado pelo Supabase sem redirecionar", async () => {
    await render(<CallbackAutenticacao descricaoErro="Acesso negado" />);
    expect(screen.getByRole("alert").props.children).toBe("Acesso negado");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("informa quando o deep link não contém o código", async () => {
    await render(<CallbackAutenticacao />);
    expect(screen.getByRole("alert").props.children).toMatch(/não contém um código/);
    expect(mockConcluir).not.toHaveBeenCalled();
  });

  it("exibe falha na troca do código", async () => {
    mockConcluir.mockRejectedValue(new Error("Código expirado"));
    await render(<CallbackAutenticacao codigo="expirado" />);
    expect(await screen.findByRole("alert")).toHaveProperty("props.children", "Código expirado");
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
