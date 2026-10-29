import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import { buscarOcorrenciaPorId } from "../services/ocorrenciasSupabase";
import PaginaDetalheOcorrencia from "../views/PaginaDetalheOcorrencia";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: jest.fn(),
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock("../services/ocorrenciasSupabase", () => ({
  buscarOcorrenciaPorId: jest.fn(),
}));

const buscarMock = jest.mocked(buscarOcorrenciaPorId);
const parametrosMock = jest.mocked(useLocalSearchParams);

describe("detalhes da ocorrência", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mostra carregamento enquanto busca os detalhes", () => {
    parametrosMock.mockReturnValue({ id: "ocorrencia-1" } as never);
    buscarMock.mockReturnValue(new Promise(() => {}));

    render(<PaginaDetalheOcorrencia />);

    expect(screen.getByText("Carregando ocorrência...")).toBeOnTheScreen();
  });

  it("informa quando a ocorrência não existe", async () => {
    parametrosMock.mockReturnValue({ id: "inexistente" } as never);
    buscarMock.mockResolvedValue(null);

    render(<PaginaDetalheOcorrencia />);

    expect(await screen.findByText("Nenhuma ocorrência encontrada")).toBeOnTheScreen();
  });

  it("mostra uma mensagem quando a consulta falha", async () => {
    parametrosMock.mockReturnValue({ id: "ocorrencia-1" } as never);
    buscarMock.mockRejectedValue(new Error("offline"));

    render(<PaginaDetalheOcorrencia />);

    expect(await screen.findByText("Não foi possível carregar a ocorrência")).toBeOnTheScreen();
  });

  it("pede para abrir a lista quando o identificador está ausente", () => {
    parametrosMock.mockReturnValue({} as never);

    render(<PaginaDetalheOcorrencia />);

    expect(screen.getByText("Identificador da ocorrência inválido")).toBeOnTheScreen();
    expect(buscarMock).not.toHaveBeenCalled();
  });
});
