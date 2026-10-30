import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import PaginaOcorrencias from "../views/PaginaOcorrencias";
import { CarregamentoGlobalProvider } from "@/shared/components/ui/CarregamentoGlobal";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { listarOcorrencias } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";

jest.mock("../services/ocorrenciasSupabase", () => ({ listarOcorrencias: jest.fn() }));
jest.mock("@/shared/components/NavegacaoInferior", () => ({ NavegacaoInferior: () => null }));
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
  await fireEvent.press(screen.getByRole("button", { name: new RegExp(rotuloCampo) }));
  await fireEvent.press(screen.getByRole("radio", { name: valor }));
}

describe("filtros públicos da listagem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listarMock.mockResolvedValue(registros);
  });

  it("filtra por bairro escolhido entre os registros do banco", async () => {
    await abrirListagem();
    await escolherFiltro("Bairro", "Jardim América");
    expect(screen.getByText("Lâmpada da praça apagada")).toBeOnTheScreen();
    expect(screen.queryByText("Buraco na rua principal")).toBeNull();
    expect(screen.getByText("1 ocorrência")).toBeOnTheScreen();
  });

  it("filtra por categoria existente nos registros", async () => {
    await abrirListagem();
    await escolherFiltro("Categoria", "Buraco na via");
    expect(screen.getByText("Buraco na rua principal")).toBeOnTheScreen();
    expect(screen.queryByText("Lâmpada da praça apagada")).toBeNull();
  });

  it("combina bairro, categoria e status", async () => {
    await abrirListagem();
    await escolherFiltro("Bairro", "Centro");
    await escolherFiltro("Categoria", "Buraco na via");
    await fireEvent.press(screen.getByRole("radio", { name: "Em andamento" }));
    expect(screen.getByText("Buraco na rua principal")).toBeOnTheScreen();
    expect(screen.getByText("1 ocorrência")).toBeOnTheScreen();
  });

  it("combina busca textual com os filtros selecionados", async () => {
    await abrirListagem();
    await escolherFiltro("Bairro", "Centro");
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
    await fireEvent.changeText(screen.getByLabelText("Buscar ocorrências"), "rua");
    await fireEvent.press(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getByLabelText("Buscar ocorrências").props.value).toBe("");
    expect(screen.getByRole("radio", { name: "Todas" }).props.accessibilityState?.selected).toBe(true);
    expect(screen.getByText("4 ocorrências")).toBeOnTheScreen();
  });

  it("diferencia ausência de correspondências de banco sem registros", async () => {
    await abrirListagem();
    await escolherFiltro("Bairro", "Jardim América");
    await escolherFiltro("Categoria", "Buraco na via");
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
