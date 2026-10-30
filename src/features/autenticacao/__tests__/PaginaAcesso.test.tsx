import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import PaginaAcesso from "../views/PaginaAcesso";
import { useAutenticacao } from "../contexto/AutenticacaoProvider";
import { cores } from "@/configs/tema";
import GoogleIcon from "@/shared/icons/devicon--google.svg";

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
jest.mock("../contexto/AutenticacaoProvider", () => ({ useAutenticacao: jest.fn() }));
jest.mock("@/shared/icons/devicon--google.svg", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

const autenticacaoMock = jest.mocked(useAutenticacao);

describe("tela de acesso", () => {
  beforeEach(() => {
    autenticacaoMock.mockReturnValue({
      usuario: null,
      carregando: false,
      autenticando: false,
      erro: null,
      autenticado: false,
      entrarComGoogle: jest.fn(async () => null),
      sair: jest.fn(async () => undefined),
    });
  });

  it("exibe o botão Google com texto legível e o ícone da marca", async () => {
    await render(<PaginaAcesso />);

    const rotulo = screen.getByText("Continuar com Google");
    expect(rotulo).toBeOnTheScreen();
    expect(StyleSheet.flatten(rotulo.props.style).color).toBe(cores.primaryDark);
    const propriedadesIcone = jest.mocked(GoogleIcon).mock.calls[0]?.[0];
    expect(propriedadesIcone).toEqual(expect.objectContaining({ width: 20, height: 20, accessibilityLabel: "Google" }));
  });
});
