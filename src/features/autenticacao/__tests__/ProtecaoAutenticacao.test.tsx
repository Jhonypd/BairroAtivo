import { render, screen } from "@testing-library/react-native";
import { createElement as mockCreateElement } from "react";
import { Text as mockText } from "react-native";
import { describe, expect, it, jest } from "@jest/globals";
import { AutenticacaoProvider } from "../contexto/AutenticacaoProvider";
import { ProtecaoAutenticacao } from "../components/ProtecaoAutenticacao";
import * as autenticacao from "../services/autenticacao";

const Texto = mockText;

jest.mock("expo-router", () => ({
  Redirect: () => mockCreateElement(mockText, null, "redirecionado-para-login"),
}));

jest.mock("../services/autenticacao", () => ({
  restaurarSessao: jest.fn(),
  observarSessao: jest.fn(() => jest.fn()),
  entrarComGoogle: jest.fn(),
  sair: jest.fn(),
}));

describe("proteção de funções autenticadas", () => {
  it("redireciona visitantes para o login", async () => {
    jest.mocked(autenticacao.restaurarSessao).mockResolvedValue(null);
    await render(<AutenticacaoProvider><ProtecaoAutenticacao><></></ProtecaoAutenticacao></AutenticacaoProvider>);
    expect(await screen.findByText("redirecionado-para-login")).toBeOnTheScreen();
  });

  it("libera a funcionalidade para uma sessão válida", async () => {
    jest.mocked(autenticacao.restaurarSessao).mockResolvedValue({
      user: { id: "usuario-1", email: "ana@example.com", user_metadata: {} },
    } as never);
    await render(
      <AutenticacaoProvider>
        <ProtecaoAutenticacao><Texto>formulário protegido</Texto></ProtecaoAutenticacao>
      </AutenticacaoProvider>,
    );
    expect(await screen.findByText("formulário protegido")).toBeOnTheScreen();
  });
});
