import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { SeletorCidadeEntrada } from "../components/SeletorCidadeEntrada";
import { useAutenticacao } from "../contexto/AutenticacaoProvider";
import { buscarCidadeDoUsuario, definirCidadeDoUsuario, listarCidadesDisponiveis } from "@/shared/services/cidadesSupabase";

jest.mock("../contexto/AutenticacaoProvider", () => ({ useAutenticacao: jest.fn() }));
jest.mock("@/shared/services/cidadesSupabase", () => ({
  buscarCidadeDoUsuario: jest.fn(),
  definirCidadeDoUsuario: jest.fn(),
  ehSchemaCidadeIndisponivel: jest.fn(() => false),
  listarCidadesDisponiveis: jest.fn(),
}));

describe("seletor de cidade ao entrar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAutenticacao).mockReturnValue({ usuario: { id: "usuario-1" } } as never);
    jest.mocked(buscarCidadeDoUsuario).mockResolvedValue(null);
    jest.mocked(listarCidadesDisponiveis).mockResolvedValue([{ codigoIbge: 4202909, nome: "Brusque", uf: "SC" }]);
    jest.mocked(definirCidadeDoUsuario).mockResolvedValue({ codigoIbge: 4202909, nome: "Brusque", uf: "SC" });
  });

  it("abre um popup obrigatório quando o perfil ainda não tem cidade", async () => {
    await render(<SeletorCidadeEntrada />);
    expect(await screen.findByText("Qual cidade você mora?")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Brusque, SC" })).toBeOnTheScreen();
  });

  it("vincula a cidade escolhida ao perfil e fecha o popup", async () => {
    await render(<SeletorCidadeEntrada />);
    await fireEvent.press(await screen.findByRole("button", { name: "Brusque, SC" }));
    await waitFor(() => expect(definirCidadeDoUsuario).toHaveBeenCalledWith("usuario-1", 4202909));
    await waitFor(() => expect(screen.queryByText("Qual cidade você mora?")).toBeNull());
  });
});
