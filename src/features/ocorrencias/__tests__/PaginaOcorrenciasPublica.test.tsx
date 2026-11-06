import { fireEvent, render, screen } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import PaginaOcorrencias from "../views/PaginaOcorrencias";
import { CarregamentoGlobalProvider } from "@/shared/components/ui/CarregamentoGlobal";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as servico from "../services/ocorrenciasSupabase";

let mockUsuarioAtual: { id: string } | null = null;

jest.mock("expo-router", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return { useFocusEffect: (callback: () => void | (() => void)) => React.useEffect(callback, [callback]) };
});

jest.mock("../services/ocorrenciasSupabase", () => ({
  listarOcorrencias: jest.fn().mockResolvedValue([] as never),
  listarMinhasOcorrencias: jest.fn().mockResolvedValue([] as never),
}));
jest.mock("@/shared/icons/filter_alt_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/search_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/location_on_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/components/NavegacaoInferior", () => ({ NavegacaoInferior: () => null }));
jest.mock("@/features/autenticacao/contexto/AutenticacaoProvider", () => ({
  useAutenticacao: () => ({ usuario: mockUsuarioAtual, carregando: false }),
}));

const ocorrenciaPropria = {
  id: "own-1", titulo: "Buraco cadastrado por mim", descricao: "Descrição suficiente",
  categoria: "Buraco na via", bairro: "Centro", status: "Aberta", registradaEm: "hoje",
};

describe("consulta pública sem autenticação", () => {
  beforeEach(() => {
    mockUsuarioAtual = null;
    jest.clearAllMocks();
  });

  it("permite abrir a listagem de ocorrências como visitante", async () => {
    await render(
      <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, right: 0, bottom: 0, left: 0 } }}>
        <CarregamentoGlobalProvider><PaginaOcorrencias /></CarregamentoGlobalProvider>
      </SafeAreaProvider>,
    );
    expect(screen.getByText("Relatos da comunidade")).toBeOnTheScreen();
    expect(screen.getByRole("tab", { name: "Todas as ocorrências" })).toBeOnTheScreen();
    expect(servico.listarOcorrencias).toHaveBeenCalled();
  });

  it("orienta visitante a entrar em Minhas sem bloquear a listagem pública", async () => {
    await render(
      <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, right: 0, bottom: 0, left: 0 } }}>
        <CarregamentoGlobalProvider><PaginaOcorrencias /></CarregamentoGlobalProvider>
      </SafeAreaProvider>,
    );
    await fireEvent.press(screen.getByRole("tab", { name: "Minhas ocorrências" }));
    expect(await screen.findByText("Entre para ver suas ocorrências")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Entrar com Google" })).toBeOnTheScreen();
    expect(screen.getByLabelText("Buscar ocorrências")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: /^Filtros/ })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("tab", { name: "Todas as ocorrências" }));
    expect(await screen.findByLabelText("Buscar ocorrências")).toBeOnTheScreen();
  });

  it("mantém os mesmos controles e troca somente para a consulta autenticada", async () => {
    mockUsuarioAtual = { id: "autor-1" };
    jest.mocked(servico.listarMinhasOcorrencias).mockResolvedValue([ocorrenciaPropria] as never);
    await render(
      <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, right: 0, bottom: 0, left: 0 } }}>
        <CarregamentoGlobalProvider><PaginaOcorrencias /></CarregamentoGlobalProvider>
      </SafeAreaProvider>,
    );
    await screen.findByText("Nenhuma ocorrência cadastrada");
    await fireEvent.press(screen.getByRole("tab", { name: "Minhas ocorrências" }));
    expect(await screen.findByText("Buraco cadastrado por mim")).toBeOnTheScreen();
    expect(screen.getByLabelText("Buscar ocorrências")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: /^Filtros/ })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Editar" })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeOnTheScreen();
    expect(servico.listarOcorrencias).toHaveBeenCalledTimes(1);
    expect(servico.listarMinhasOcorrencias).toHaveBeenCalledTimes(1);
  });
});
