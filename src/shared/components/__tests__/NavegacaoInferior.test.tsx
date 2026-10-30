import { fireEvent, render, screen } from "@testing-library/react-native";
import { describe, expect, it, jest } from "@jest/globals";
import { router } from "expo-router";
import { NavegacaoInferior } from "../NavegacaoInferior";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ bottom: 0 }) }));
jest.mock("@/shared/icons/home_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/assignment_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/add_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/manage_accounts_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));

describe("navegação de cadastro", () => {
  it("abre a rota protegida do formulário pela aba Registrar", async () => {
    await render(<NavegacaoInferior ativa="inicio" />);
    fireEvent.press(screen.getByRole("button", { name: "Registrar" }));
    expect(router.push).toHaveBeenCalledWith("/ocorrencias/nova");
  });
});
