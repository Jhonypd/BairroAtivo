import { fireEvent, render, screen } from "@testing-library/react-native";
import { describe, expect, it, jest } from "@jest/globals";
import PaginaPerfil from "../views/PaginaPerfil";
import { useAutenticacao } from "../contexto/AutenticacaoProvider";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/shared/components/NavegacaoInferior", () => ({ NavegacaoInferior: () => null }));
jest.mock("../contexto/AutenticacaoProvider", () => ({ useAutenticacao: jest.fn() }));

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
});
