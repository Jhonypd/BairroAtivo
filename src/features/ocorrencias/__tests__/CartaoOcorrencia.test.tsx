import { fireEvent, render } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { router } from "expo-router";
import { CartaoOcorrencia } from "../components/CartaoOcorrencia";
import type { Ocorrencia } from "../types/Ocorrencia";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/shared/icons/location_on_24dp_E3E3E3.svg", () => "IconeLocalizacao");

const ocorrencia: Ocorrencia = {
  id: "ocorrencia-1",
  titulo: "Buraco grande na rua principal",
  descricao: "Asfalto danificado perto da praça.",
  categoria: "Buraco na via",
  bairro: "Centro",
  status: "Aberta",
  registradaEm: "12 nov. 2024",
  nomeAutorPublico: "Ana Costa",
  imagemUrl: "https://exemplo.invalid/foto.jpg",
};

describe("CartaoOcorrencia", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("exibe os dados, imagem real opcional e ação no mesmo cartão acessível", async () => {
    const { getByText, getByLabelText, getByRole } = await render(<CartaoOcorrencia ocorrencia={ocorrencia} />);

    expect(getByText("Buraco na via")).toBeTruthy();
    expect(getByText("Aberta")).toBeTruthy();
    expect(getByText("Buraco grande na rua principal")).toBeTruthy();
    expect(getByText("Centro")).toBeTruthy();
    expect(getByText("Por Ana Costa")).toBeTruthy();
    expect(getByText("12 nov. 2024")).toBeTruthy();
    expect(getByText("Ver detalhes")).toBeTruthy();

    const imagem = getByLabelText("Foto da ocorrência");
    expect(imagem.props.source).toEqual({ uri: ocorrencia.imagemUrl });
    expect(imagem.props.resizeMode).toBe("cover");

    fireEvent.press(getByRole("button"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/ocorrencias/[id]",
      params: { id: ocorrencia.id },
    });
  });

  it("mantém o espaço da miniatura sem inventar uma imagem quando não há foto", async () => {
    const { queryByLabelText, getByText } = await render(
      <CartaoOcorrencia ocorrencia={{ ...ocorrencia, imagemUrl: undefined, nomeAutorPublico: undefined }} />,
    );

    expect(queryByLabelText("Foto da ocorrência")).toBeNull();
    expect(getByText("Autor não informado")).toBeTruthy();
  });
});
