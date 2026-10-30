import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { Botao } from "../Botao";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

describe("Botao com navegação", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exibe o rótulo e navega para a rota informada", async () => {
    await render(<Botao label="Ver ocorrências" href="/ocorrencias" />);

    const botao = screen.getByRole("button", { name: "Ver ocorrências" });
    expect(botao).toBeTruthy();

    await fireEvent.press(botao);

    expect(router.push).toHaveBeenCalledWith("/ocorrencias");
  });
});
