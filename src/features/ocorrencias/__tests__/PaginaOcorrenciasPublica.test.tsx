import { render, screen } from "@testing-library/react-native";
import { describe, expect, it, jest } from "@jest/globals";
import PaginaOcorrencias from "../views/PaginaOcorrencias";
import { CarregamentoGlobalProvider } from "@/shared/components/ui/CarregamentoGlobal";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as servico from "../services/ocorrenciasSupabase";

jest.mock("../services/ocorrenciasSupabase", () => ({
  listarOcorrencias: jest.fn().mockResolvedValue([] as never),
}));
jest.mock("@/shared/components/NavegacaoInferior", () => ({ NavegacaoInferior: () => null }));

describe("consulta pública sem autenticação", () => {
  it("permite abrir a listagem de ocorrências como visitante", async () => {
    await render(
      <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, right: 0, bottom: 0, left: 0 } }}>
        <CarregamentoGlobalProvider><PaginaOcorrencias /></CarregamentoGlobalProvider>
      </SafeAreaProvider>,
    );
    expect(screen.getByText("Relatos da comunidade")).toBeOnTheScreen();
    expect(servico.listarOcorrencias).toHaveBeenCalled();
  });
});
