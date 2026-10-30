import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import { buscarOcorrenciaPorId } from "../services/ocorrenciasSupabase";
import PaginaDetalheOcorrencia from "../views/PaginaDetalheOcorrencia";
import { CarregamentoGlobalProvider } from "@/shared/components/ui/CarregamentoGlobal";

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

async function renderDetalhes() {
  return render(<CarregamentoGlobalProvider><PaginaDetalheOcorrencia /></CarregamentoGlobalProvider>);
}

describe("detalhes da ocorrência", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mostra carregamento enquanto busca os detalhes", async () => {
    parametrosMock.mockReturnValue({ id: "ocorrencia-1" } as never);
    buscarMock.mockReturnValue(new Promise(() => {}));

    await renderDetalhes();

    expect(screen.getByLabelText("Carregando ocorrência")).toBeOnTheScreen();
  });

  it("informa quando a ocorrência não existe", async () => {
    parametrosMock.mockReturnValue({ id: "inexistente" } as never);
    buscarMock.mockResolvedValue(null);

    await renderDetalhes();

    expect(await screen.findByText("Nenhuma ocorrência encontrada")).toBeOnTheScreen();
  });

  it("mostra uma mensagem quando a consulta falha", async () => {
    parametrosMock.mockReturnValue({ id: "ocorrencia-1" } as never);
    buscarMock.mockRejectedValue(new Error("offline"));

    await renderDetalhes();

    expect(await screen.findByText("Não foi possível carregar a ocorrência")).toBeOnTheScreen();
  });

  it("pede para abrir a lista quando o identificador está ausente", async () => {
    parametrosMock.mockReturnValue({} as never);

    await renderDetalhes();

    expect(screen.getByText("Identificador da ocorrência inválido")).toBeOnTheScreen();
    expect(buscarMock).not.toHaveBeenCalled();
  });
});
