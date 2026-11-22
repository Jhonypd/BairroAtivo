import { fireEvent, render, screen } from "@testing-library/react-native";
import { describe, expect, it, jest } from "@jest/globals";
import PaginaPerfil from "../views/PaginaPerfil";
import { useAutenticacao } from "../contexto/AutenticacaoProvider";
import { definirCidadeDoUsuario, ehSchemaCidadeIndisponivel, listarCidadesDisponiveis } from "@/shared/services/cidadesSupabase";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/shared/components/NavegacaoInferior", () => ({ NavegacaoInferior: () => null }));
jest.mock("../contexto/AutenticacaoProvider", () => ({ useAutenticacao: jest.fn() }));
jest.mock("@/shared/services/cidadesSupabase", () => ({
  buscarCidadeDoUsuario: jest.fn(async () => null),
  ehSchemaCidadeIndisponivel: jest.fn(() => false),
  listarCidadesDisponiveis: jest.fn(async () => [{ codigoIbge: 4202909, nome: "Brusque", uf: "SC" }]),
  definirCidadeDoUsuario: jest.fn(async () => ({ codigoIbge: 4202909, nome: "Brusque", uf: "SC" })),
}));

const useAutenticacaoMock = jest.mocked(useAutenticacao);

describe("perfil da conta", () => {
  it("apresenta dados básicos do usuário Google e permite sair", async () => {
    const sair = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    useAutenticacaoMock.mockReturnValue({
      usuario: { user_metadata: { full_name: "Jhony Pereira" }, email: "jhony@example.com" } as never,
      carregando: false, autenticando: false, erro: null,
      entrarComGoogle: async () => null, sair,
      autenticado: true,
    });
    await render(<PaginaPerfil />);
    expect(screen.getByText("Jhony Pereira")).toBeOnTheScreen();
    expect(screen.getByText("jhony@example.com")).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Sair da conta" }));
    expect(sair).toHaveBeenCalled();
  });

  it("oferece acesso Google ao visitante", async () => {
    useAutenticacaoMock.mockReturnValue({
      usuario: null, carregando: false, autenticando: false, erro: null,
      entrarComGoogle: async () => null, sair: async () => undefined, autenticado: false,
    });
    await render(<PaginaPerfil />);
    expect(screen.getByText("Você está navegando como visitante")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Entrar com Google" })).toBeOnTheScreen();
  });

  it("explica onde escolher cidade e salva a opção selecionada", async () => {
    useAutenticacaoMock.mockReturnValue({
      usuario: { id: "usuario-1", user_metadata: {} } as never, carregando: false, autenticando: false, erro: null,
      entrarComGoogle: async () => null, sair: async () => undefined, autenticado: true,
    });
    await render(<PaginaPerfil />);
    await fireEvent.press(await screen.findByRole("button", { name: "Brusque, SC" }));
    expect(definirCidadeDoUsuario).toHaveBeenCalledWith("usuario-1", 4202909);
  });

  it("informa quando o catálogo de cidades ainda não foi aplicado ao banco", async () => {
    useAutenticacaoMock.mockReturnValue({
      usuario: { id: "usuario-1", user_metadata: {} } as never, carregando: false, autenticando: false, erro: null,
      entrarComGoogle: async () => null, sair: async () => undefined, autenticado: true,
    });
    jest.mocked(listarCidadesDisponiveis).mockRejectedValueOnce(new Error("catálogo ausente"));
    jest.mocked(ehSchemaCidadeIndisponivel).mockReturnValueOnce(true);
    await render(<PaginaPerfil />);
    expect(await screen.findByText(/O catálogo de cidades ainda não foi ativado no banco/)).toBeOnTheScreen();
  });
});
