import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import { buscarOcorrenciaPorId } from "../services/ocorrenciasSupabase";
import PaginaDetalheOcorrencia from "../views/PaginaDetalheOcorrencia";
import { CarregamentoGlobalProvider } from "@/shared/components/ui/CarregamentoGlobal";
import type { Ocorrencia } from "../types/Ocorrencia";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: jest.fn(),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) },
}));

jest.mock("../services/ocorrenciasSupabase", () => ({
  buscarOcorrenciaPorId: jest.fn(),
}));
jest.mock("react-native-safe-area-context", () => ({
  ...jest.requireActual<typeof import("react-native-safe-area-context")>("react-native-safe-area-context"),
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock("@/shared/icons/location_on_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/category_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/assignment_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/info_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/photo_library_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/home_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/add_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/manage_accounts_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));

const buscarMock = jest.mocked(buscarOcorrenciaPorId);
const parametrosMock = jest.mocked(useLocalSearchParams);

async function renderDetalhes() {
  return render(<CarregamentoGlobalProvider><PaginaDetalheOcorrencia /></CarregamentoGlobalProvider>);
}

const detalhe: Ocorrencia = {
  id: "ocorrencia-1",
  titulo: "Buraco na via",
  descricao: "Buraco grande na Rua das Flores, dificultando o trânsito de veículos.",
  categoria: "Infraestrutura",
  bairro: "Centro",
  status: "Aberta",
  registradaEm: "12 de nov. de 2024",
  nomeAutorPublico: "João Silva",
  imagemUrl: "https://exemplo.invalid/foto.jpg",
};

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

  it("exibe foto, status, informações e localização no layout dos detalhes", async () => {
    parametrosMock.mockReturnValue({ id: detalhe.id } as never);
    buscarMock.mockResolvedValue(detalhe);

    await renderDetalhes();

    expect(await screen.findByText("Buraco na via")).toBeOnTheScreen();
    expect(screen.getByText("Aberta")).toBeOnTheScreen();
    expect(screen.getByText("Bairro")).toBeOnTheScreen();
    expect(screen.getByText("Categoria")).toBeOnTheScreen();
    expect(screen.getByText("Infraestrutura")).toBeOnTheScreen();
    expect(screen.getByText("Data de registro")).toBeOnTheScreen();
    expect(screen.getByText(detalhe.registradaEm)).toBeOnTheScreen();
    expect(screen.getByText(detalhe.descricao)).toBeOnTheScreen();
    expect(screen.getByText("Região informada: Centro")).toBeOnTheScreen();
    expect(screen.getByLabelText("Foto de Buraco na via").props.source).toEqual({
      uri: detalhe.imagemUrl,
    });
  });

  it("mostra placeholder neutro quando não há foto cadastrada", async () => {
    parametrosMock.mockReturnValue({ id: detalhe.id } as never);
    buscarMock.mockResolvedValue({ ...detalhe, imagemUrl: undefined });

    await renderDetalhes();

    expect(await screen.findByLabelText("Foto não disponível")).toBeOnTheScreen();
  });

  it("pede para abrir a lista quando o identificador está ausente", async () => {
    parametrosMock.mockReturnValue({} as never);

    await renderDetalhes();

    expect(screen.getByText("Identificador da ocorrência inválido")).toBeOnTheScreen();
    expect(buscarMock).not.toHaveBeenCalled();
  });
});
