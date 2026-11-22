import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import PaginaOcorrencias from "../views/PaginaOcorrencias";
import { CarregamentoGlobalProvider } from "@/shared/components/ui/CarregamentoGlobal";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { listarOcorrencias } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";

let mockFocarTela: (() => void | (() => void)) | null = null;

jest.mock("../services/ocorrenciasSupabase", () => ({ listarOcorrencias: jest.fn() }));
jest.mock("@/shared/icons/filter_alt_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/search_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/location_on_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/features/autenticacao/contexto/AutenticacaoProvider", () => ({
  useAutenticacao: () => ({ usuario: null, carregando: false }),
}));
jest.mock("@/shared/components/NavegacaoInferior", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { Pressable, Text } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    NavegacaoInferior: () => React.createElement(
      Pressable,
      { testID: "simular-retorno-a-listagem", onPress: () => { mockFocarTela?.(); } },
      React.createElement(Text, null, "Simular retorno à listagem"),
    ),
  };
});
jest.mock("expo-router", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    router: { push: jest.fn(), replace: jest.fn() },
    useFocusEffect: (callback: () => void | (() => void)) => {
      mockFocarTela = callback;
      return React.useEffect(callback, [callback]);
    },
  };
});
jest.mock("react-native/Libraries/Components/RefreshControl/RefreshControl", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { Pressable } = jest.requireActual<typeof import("react-native")>("react-native");
  return {
    __esModule: true,
    default: function RefreshControlDeTeste({ onRefresh }: { onRefresh: () => void }) {
      return React.createElement(Pressable, { testID: "atualizar-ocorrencias", onPress: onRefresh });
    },
  };
});

const listarMock = jest.mocked(listarOcorrencias);
const registros: Ocorrencia[] = [
  { id: "3", titulo: "Calçada danificada na rua das Flores", descricao: "Piso solto", categoria: "Calçada danificada", bairro: "Centro", status: "Aberta", registradaEm: "30 de out. de 2026" },
  { id: "2", titulo: "Buraco na rua principal", descricao: "Cratera", categoria: "Buraco na via", bairro: "Centro", status: "Em acompanhamento", registradaEm: "29 de out. de 2026" },
  { id: "1", titulo: "Lâmpada da praça apagada", descricao: "Poste escuro", categoria: "Iluminação pública", bairro: "Jardim América", status: "Aberta", registradaEm: "28 de out. de 2026" },
  { id: "0", titulo: "Coleta de lixo atrasada", descricao: "Resíduos acumulados", categoria: "Descarte irregular de lixo", bairro: "Centro", status: "Resolvida", registradaEm: "27 de out. de 2026" },
];

async function abrirListagem() {
  await render(
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, right: 0, bottom: 0, left: 0 } }}>
      <CarregamentoGlobalProvider><PaginaOcorrencias /></CarregamentoGlobalProvider>
    </SafeAreaProvider>,
  );
  await waitFor(() => expect(listarMock).toHaveBeenCalledTimes(1));
}

async function escolherFiltro(rotuloCampo: string, valor: string) {
  if (!screen.getByRole("button", { name: /^Filtros/ }).props.accessibilityState?.expanded) {
    await fireEvent.press(screen.getByRole("button", { name: /^Filtros/ }));
  }
  await fireEvent.press(screen.getByRole("button", { name: new RegExp(rotuloCampo) }));
  await fireEvent.press(screen.getByRole("radio", { name: valor }));
}

async function aplicarFiltros() {
  const chamadas = listarMock.mock.calls.length;
  await fireEvent.press(screen.getByRole("button", { name: "Aplicar filtros" }));
  await waitFor(() => expect(listarMock).toHaveBeenCalledTimes(chamadas + 1));
  await waitFor(() => expect(screen.getByRole("button", { name: /^Filtros/ }).props.accessibilityState?.expanded).toBe(false));
}

describe("filtros públicos da listagem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFocarTela = null;
    listarMock.mockResolvedValue(registros);
  });

  it("mantém a lista até aplicar o bairro escolhido", async () => {
    await abrirListagem();
    await escolherFiltro("Bairro", "Jardim América");
    expect(screen.getByText("4 ocorrências")).toBeOnTheScreen();
    await aplicarFiltros();
    expect(screen.getByText("Lâmpada da praça apagada")).toBeOnTheScreen();
    expect(screen.queryByText("Buraco na rua principal")).toBeNull();
    expect(screen.getByText("1 ocorrência")).toBeOnTheScreen();
  });

  it("filtra por categoria existente nos registros", async () => {
    await abrirListagem();
    await escolherFiltro("Categoria", "Buraco na via");
    await aplicarFiltros();
    expect(screen.getByText("Buraco na rua principal")).toBeOnTheScreen();
    expect(screen.queryByText("Lâmpada da praça apagada")).toBeNull();
  });

  it("mantém filtros ativos até aplicar e limpa apenas o rascunho", async () => {
    await abrirListagem();
    await escolherFiltro("Bairro", "Centro");
    await escolherFiltro("Categoria", "Buraco na via");
    expect(screen.getByText("4 ocorrências")).toBeOnTheScreen();
    await aplicarFiltros();
    expect(screen.queryByText(/^Filtros:/)).toBeNull();
    expect(screen.getByText("2 filtros ativos · Centro · Buraco na via")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: /^Filtros/ }));
    expect(screen.getByRole("button", { name: "Limpar bairro" })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Limpar categoria" })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("button", { name: "Limpar categoria" }));
    expect(screen.getByLabelText("Bairro: Centro")).toBeOnTheScreen();
    expect(screen.getByLabelText("Categoria: Todas as categorias")).toBeOnTheScreen();
    expect(screen.getByText("1 ocorrência")).toBeOnTheScreen();
    await aplicarFiltros();
    expect(screen.getByText("3 ocorrências")).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("button", { name: /^Filtros/ }));
    await fireEvent.press(screen.getByRole("button", { name: "Limpar bairro" }));
    expect(screen.getByLabelText("Bairro: Todos os bairros")).toBeOnTheScreen();
    expect(screen.getByText("3 ocorrências")).toBeOnTheScreen();
    await aplicarFiltros();
    expect(screen.getByText("4 ocorrências")).toBeOnTheScreen();
  });

  it("abre as opções como menu sobreposto sem aumentar o espaço do filtro", async () => {
    await abrirListagem();
    await fireEvent.press(screen.getByRole("button", { name: /^Filtros/ }));
    await fireEvent.press(screen.getByRole("radio", { name: "Abertas" }));
    await fireEvent.press(screen.getByRole("button", { name: /Categoria/ }));
    const opcoes = screen.getByTestId("opcoes-campo-selecao");
    expect(StyleSheet.flatten(opcoes.props.style).position).toBe("absolute");
    expect(StyleSheet.flatten(screen.getByTestId("container-filtros-combos").props.style).zIndex).toBeGreaterThan(0);
    expect(screen.getByRole("radio", { name: "Buraco na via" })).toBeOnTheScreen();
  });

  it("combina bairro, categoria e status", async () => {
    await abrirListagem();
    await escolherFiltro("Bairro", "Centro");
    await escolherFiltro("Categoria", "Buraco na via");
    await fireEvent.press(screen.getByRole("radio", { name: "Em andamento" }));
    await aplicarFiltros();
    expect(screen.getByText("Buraco na rua principal")).toBeOnTheScreen();
    expect(screen.getByText("1 ocorrência")).toBeOnTheScreen();
  });

  it("combina busca textual com os filtros selecionados", async () => {
    await abrirListagem();
    await escolherFiltro("Bairro", "Centro");
    await aplicarFiltros();
    await fireEvent.changeText(screen.getByLabelText("Buscar ocorrências"), "calçada");
    expect(screen.getByText("Calçada danificada na rua das Flores")).toBeOnTheScreen();
    expect(screen.queryByText("Buraco na rua principal")).toBeNull();
    expect(screen.getByText("1 ocorrência")).toBeOnTheScreen();
  });

  it("limpa texto, bairro, categoria e status", async () => {
    await abrirListagem();
    await escolherFiltro("Bairro", "Centro");
    await escolherFiltro("Categoria", "Buraco na via");
    await fireEvent.press(screen.getByRole("radio", { name: "Abertas" }));
    await aplicarFiltros();
    await fireEvent.changeText(screen.getByLabelText("Buscar ocorrências"), "rua");
    await fireEvent.press(screen.getByRole("button", { name: /^Filtros/ }));
    await fireEvent.press(screen.getByRole("button", { name: "Limpar" }));
    expect(screen.getByLabelText("Buscar ocorrências").props.value).toBe("rua");
    await aplicarFiltros();
    expect(screen.getByLabelText("Buscar ocorrências").props.value).toBe("rua");
    await fireEvent.changeText(screen.getByLabelText("Buscar ocorrências"), "");
    expect(screen.getByText("4 ocorrências")).toBeOnTheScreen();
  });

  it("descarta rascunhos ao fechar e reabrir o painel", async () => {
    await abrirListagem();
    await escolherFiltro("Bairro", "Centro");
    expect(screen.getByText("4 ocorrências")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Fechar filtros" }));
    await fireEvent.press(screen.getByRole("button", { name: /^Filtros/ }));
    expect(screen.getByLabelText("Bairro: Todos os bairros")).toBeOnTheScreen();
  });

  it("mantém painel e filtros aplicados se a atualização falhar", async () => {
    await abrirListagem();
    await escolherFiltro("Bairro", "Centro");
    listarMock.mockRejectedValueOnce(new Error("offline"));
    await fireEvent.press(screen.getByRole("button", { name: "Aplicar filtros" }));
    expect(await screen.findByText(/Os resultados exibidos podem estar desatualizados/)).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: /^Filtros/ }).props.accessibilityState?.expanded).toBe(true);
    expect(screen.getByText("4 ocorrências")).toBeOnTheScreen();
  });

  it("exibe loading global durante a atualização dos filtros", async () => {
    await abrirListagem();
    await fireEvent.press(screen.getByRole("button", { name: /^Filtros/ }));
    let concluir!: (resultado: Ocorrencia[]) => void;
    listarMock.mockReturnValueOnce(new Promise((resolve) => { concluir = resolve; }));
    await fireEvent.press(screen.getByRole("button", { name: "Aplicar filtros" }));
    expect(await screen.findByText("Atualizando ocorrências")).toBeOnTheScreen();
    expect(screen.getByText("Aguarde um instante...")).toBeOnTheScreen();
    await act(async () => { concluir(registros); });
    await waitFor(() => expect(screen.getByRole("button", { name: /^Filtros/ }).props.accessibilityState?.expanded).toBe(false));
  });

  it("diferencia ausência de correspondências de banco sem registros", async () => {
    await abrirListagem();
    await escolherFiltro("Bairro", "Jardim América");
    await escolherFiltro("Categoria", "Buraco na via");
    await aplicarFiltros();
    expect(screen.getByText("Nenhuma ocorrência encontrada")).toBeOnTheScreen();
  });

  it("mantém a ordenação recebida do serviço ao aplicar filtros", async () => {
    await abrirListagem();
    const cartoes = screen.getAllByRole("button", { name: /^Ver detalhes de/ });
    expect(cartoes.map((cartao) => cartao.props.accessibilityLabel)).toEqual([
      "Ver detalhes de Calçada danificada na rua das Flores",
      "Ver detalhes de Buraco na rua principal",
      "Ver detalhes de Lâmpada da praça apagada",
      "Ver detalhes de Coleta de lixo atrasada",
    ]);
  });

  it("atualiza os registros quando a tela volta a receber foco", async () => {
    await abrirListagem();
    await fireEvent.press(screen.getByTestId("simular-retorno-a-listagem"));
    await waitFor(() => expect(listarMock).toHaveBeenCalledTimes(2));
  });

  it("mostra erro de conexão e permite tentar novamente", async () => {
    listarMock.mockRejectedValueOnce(new Error("offline"));
    await abrirListagem();
    expect(await screen.findByText("Não foi possível conectar ao servidor. Tente novamente.")).toBeOnTheScreen();
    expect(screen.getByText("Não foi possível carregar")).toBeOnTheScreen();
  });

  it("mantém os resultados e informa quando uma atualização falha", async () => {
    await abrirListagem();
    expect(await screen.findByText("4 ocorrências")).toBeOnTheScreen();
    listarMock.mockRejectedValueOnce(new Error("offline"));
    await fireEvent.press(screen.getByTestId("atualizar-ocorrencias"));
    expect(await screen.findByText(/Os resultados exibidos podem estar desatualizados/)).toBeOnTheScreen();
    expect(screen.getByText("Calçada danificada na rua das Flores")).toBeOnTheScreen();
  });

  it("não sobrescreve uma atualização nova com uma resposta antiga", async () => {
    let concluirInicial!: (valor: Ocorrencia[]) => void;
    let concluirAtualizacao!: (valor: Ocorrencia[]) => void;
    listarMock
      .mockReturnValueOnce(new Promise((resolve) => { concluirInicial = resolve; }))
      .mockReturnValueOnce(new Promise((resolve) => { concluirAtualizacao = resolve; }));

    await render(
      <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, right: 0, bottom: 0, left: 0 } }}>
        <CarregamentoGlobalProvider><PaginaOcorrencias /></CarregamentoGlobalProvider>
      </SafeAreaProvider>,
    );
    await waitFor(() => expect(listarMock).toHaveBeenCalledTimes(1));
    await fireEvent.press(screen.getByTestId("atualizar-ocorrencias"));
    await waitFor(() => expect(listarMock).toHaveBeenCalledTimes(2));
    await act(async () => { concluirAtualizacao([registros[0]!]); });
    expect(await screen.findByText("Calçada danificada na rua das Flores")).toBeOnTheScreen();
    await act(async () => { concluirInicial([registros[1]!]); });
    await waitFor(() => expect(screen.queryByText("Buraco na rua principal")).toBeNull());
    expect(screen.getByText("Calçada danificada na rua das Flores")).toBeOnTheScreen();
  });

  it("mostra estado vazio quando o banco ainda não tem ocorrências", async () => {
    listarMock.mockResolvedValue([]);
    await abrirListagem();
    await waitFor(() => expect(screen.getByText("Nenhuma ocorrência cadastrada")).toBeOnTheScreen());
  });
});
