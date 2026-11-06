import { fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";
import type { AlertButton } from "react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { PaginaMinhasOcorrencias } from "../views/PaginaMinhasOcorrencias";
import { excluirOcorrencia, listarMinhasOcorrencias, listarOcorrencias } from "../services/ocorrenciasSupabase";
import { CarregamentoGlobalProvider } from "@/shared/components/ui/CarregamentoGlobal";
import type { Ocorrencia } from "../types/Ocorrencia";

jest.mock("../services/ocorrenciasSupabase", () => ({ listarMinhasOcorrencias: jest.fn(), listarOcorrencias: jest.fn(), excluirOcorrencia: jest.fn() }));
jest.mock("@/shared/components/NavegacaoInferior", () => ({ NavegacaoInferior: () => null }));
jest.mock("@/shared/icons/location_on_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/filter_alt_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/search_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/features/autenticacao/contexto/AutenticacaoProvider", () => ({
  useAutenticacao: () => ({ usuario: { id: "autor-1" }, carregando: false }),
}));
// Jest mock factories cannot reference imported bindings outside the factory.
jest.mock("expo-router", () => ({ router: { push: jest.fn() }, useFocusEffect: (callback: () => void) => jest.requireActual<typeof import("react")>("react").useEffect(callback, []) }));

const propria: Ocorrencia = { id: "1", titulo: "Buraco no Centro", descricao: "Cratera perto da praça.", categoria: "Buraco na via", bairro: "Centro", status: "Aberta", registradaEm: "30 de out. de 2026" };

describe("Minhas ocorrências", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(listarMinhasOcorrencias).mockResolvedValue([propria]);
    jest.mocked(listarOcorrencias).mockResolvedValue([]);
  });

  async function abrirTela() {
    await render(<CarregamentoGlobalProvider><PaginaMinhasOcorrencias /></CarregamentoGlobalProvider>);
  }

  it("exibe somente os resultados retornados pela consulta autenticada", async () => {
    await abrirTela();
    expect(await screen.findByText("Buraco no Centro")).toBeOnTheScreen();
    expect(listarMinhasOcorrencias).toHaveBeenCalled();
    expect(listarOcorrencias).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Buscar ocorrências")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: /^Filtros/ })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Editar" })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeOnTheScreen();
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

  it("solicita confirmação explícita antes de excluir", async () => {
    const alerta = jest.spyOn(Alert, "alert").mockImplementation((_titulo?: string | null, _mensagem?: string | null, botoes?: AlertButton[]) => { botoes?.[0].onPress?.(); });
    await abrirTela();
    await screen.findByText("Buraco no Centro");
    fireEvent.press(screen.getByText("Excluir"));
    expect(alerta).toHaveBeenCalledWith("Excluir ocorrência?", expect.stringContaining("irreversível"), expect.any(Array));
    expect(excluirOcorrencia).not.toHaveBeenCalled();
    alerta.mockRestore();
  });
});
