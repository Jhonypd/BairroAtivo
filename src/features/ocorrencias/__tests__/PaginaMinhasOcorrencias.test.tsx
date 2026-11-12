import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import { PaginaMinhasOcorrencias } from "../views/PaginaMinhasOcorrencias";
import { excluirOcorrencia, listarMinhasOcorrencias, listarOcorrencias } from "../services/ocorrenciasSupabase";
import { CarregamentoGlobalProvider } from "@/shared/components/ui/CarregamentoGlobal";
import type { Ocorrencia } from "../types/Ocorrencia";

jest.mock("../services/ocorrenciasSupabase", () => ({ listarMinhasOcorrencias: jest.fn(), listarOcorrencias: jest.fn(), excluirOcorrencia: jest.fn() }));
jest.mock("@/shared/components/NavegacaoInferior", () => ({ NavegacaoInferior: () => null }));
jest.mock("@/shared/icons/location_on_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/filter_alt_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/search_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/ellipsis-vertical.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/pencil.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/trash-2.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/chevron-right.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/x.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/features/autenticacao/contexto/AutenticacaoProvider", () => ({
  useAutenticacao: () => ({ usuario: { id: "autor-1" }, carregando: false }),
}));
// Jest mock factories cannot reference imported bindings outside the factory.
jest.mock("expo-router", () => ({ router: { push: jest.fn() }, useFocusEffect: (callback: () => void) => jest.requireActual<typeof import("react")>("react").useEffect(callback, []) }));

const propria: Ocorrencia = { id: "1", titulo: "Buraco no Centro", descricao: "Cratera perto da praça.", categoria: "Buraco na via", bairro: "Centro", status: "Aberta", registradaEm: "30 de out. de 2026" };

describe("Minhas ocorrências", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(excluirOcorrencia).mockResolvedValue(undefined);
    jest.mocked(listarMinhasOcorrencias).mockResolvedValue([propria]);
    jest.mocked(listarOcorrencias).mockResolvedValue([]);
  });

  async function abrirTela() {
    await render(
      <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, right: 0, bottom: 0, left: 0 } }}>
        <CarregamentoGlobalProvider><PaginaMinhasOcorrencias /></CarregamentoGlobalProvider>
      </SafeAreaProvider>,
    );
  }

  it("exibe somente os resultados retornados pela consulta autenticada", async () => {
    await abrirTela();
    expect(await screen.findByText("Buraco no Centro")).toBeOnTheScreen();
    expect(listarMinhasOcorrencias).toHaveBeenCalled();
    expect(listarOcorrencias).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Buscar ocorrências")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: /^Filtros/ })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Abrir opções de Buraco no Centro" })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: /^Filtros/ }));
    expect(screen.getByRole("radio", { name: "Abertas" })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: /Bairro: Todos os bairros/ })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: /Categoria: Todas as categorias/ })).toBeOnTheScreen();
  });

  it("informa quando o usuário ainda não tem ocorrências", async () => {
    jest.mocked(listarMinhasOcorrencias).mockResolvedValue([]);
    await abrirTela();
    expect(await screen.findByText("Você ainda não cadastrou ocorrências")).toBeOnTheScreen();
  });

  it("abre a edição a partir das ações do card próprio", async () => {
    await abrirTela();
    await screen.findByText("Buraco no Centro");
    await fireEvent.press(screen.getByRole("button", { name: "Abrir opções de Buraco no Centro" }));
    await fireEvent.press(screen.getByRole("button", { name: /Editar ocorrência/ }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/ocorrencias/editar/[id]",
      params: { id: propria.id },
    });
  });

  it("exige confirmação antes de excluir e remove o card após sucesso", async () => {
    await abrirTela();
    await screen.findByText("Buraco no Centro");
    await fireEvent.press(screen.getByRole("button", { name: "Abrir opções de Buraco no Centro" }));
    await fireEvent.press(screen.getByRole("button", { name: /Excluir ocorrência/ }));
    expect(screen.getByText("Esta ação não poderá ser desfeita. Tem certeza de que deseja excluir esta ocorrência?")).toBeOnTheScreen();
    expect(excluirOcorrencia).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole("button", { name: "Excluir ocorrência" }));
    await waitFor(() => expect(excluirOcorrencia).toHaveBeenCalledWith(propria.id));
    expect(screen.queryByText("Buraco no Centro")).toBeNull();
  });

  it("permite cancelar a confirmação sem excluir", async () => {
    await abrirTela();
    await screen.findByText("Buraco no Centro");
    await fireEvent.press(screen.getByRole("button", { name: "Abrir opções de Buraco no Centro" }));
    await fireEvent.press(screen.getByRole("button", { name: /Excluir ocorrência/ }));
    await fireEvent.press(screen.getByRole("button", { name: "Cancelar" }));
    expect(excluirOcorrencia).not.toHaveBeenCalled();
    expect(screen.getAllByText("Buraco no Centro").length).toBeGreaterThan(0);
  });

  it("mantém a ocorrência e mostra erro se a exclusão falhar", async () => {
    jest.mocked(excluirOcorrencia).mockRejectedValue(new Error("Falha de autorização"));
    await abrirTela();
    await screen.findByText("Buraco no Centro");
    await fireEvent.press(screen.getByRole("button", { name: "Abrir opções de Buraco no Centro" }));
    await fireEvent.press(screen.getByRole("button", { name: /Excluir ocorrência/ }));
    await fireEvent.press(screen.getByRole("button", { name: "Excluir ocorrência" }));
    expect(await screen.findByText("Falha de autorização")).toBeOnTheScreen();
    expect(screen.getAllByText("Buraco no Centro").length).toBeGreaterThan(0);
  });
});
