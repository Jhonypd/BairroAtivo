import { render, screen } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { useLocalSearchParams } from "expo-router";
import { buscarOcorrenciaPorId } from "@/features/ocorrencias/services/ocorrenciasSupabase";
import RotaEditarOcorrencia from "@/app/ocorrencias/editar/[id]";

jest.mock("expo-router", () => ({ Stack: { Screen: () => null }, useLocalSearchParams: jest.fn() }));
jest.mock("@/features/autenticacao/components/ProtecaoAutenticacao", () => ({ ProtecaoAutenticacao: ({ children }: { children: React.ReactNode }) => children }));
jest.mock("@/features/ocorrencias/services/ocorrenciasSupabase", () => ({ buscarOcorrenciaPorId: jest.fn() }));
jest.mock("@/features/ocorrencias/views/FormularioOcorrencia", () => () => null);

describe("rota de edição de ocorrência", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "123" });
  });

  it("mostra erro de ID inválido sem consultar o serviço", async () => {
    await render(<RotaEditarOcorrencia />);
    expect(await screen.findByText("O identificador da ocorrência é inválido.")).toBeOnTheScreen();
    expect(buscarOcorrenciaPorId).not.toHaveBeenCalled();
  });

  it("encerra o carregamento quando o registro não existe", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "11111111-1111-4111-8111-111111111111" });
    jest.mocked(buscarOcorrenciaPorId).mockResolvedValue(null);
    await render(<RotaEditarOcorrencia />);
    expect(await screen.findByText("Esta ocorrência não foi encontrada ou não está disponível.")).toBeOnTheScreen();
  });

  it("apresenta estado de erro se a consulta falhar", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "11111111-1111-4111-8111-111111111111" });
    jest.mocked(buscarOcorrenciaPorId).mockRejectedValue(new Error("offline"));
    await render(<RotaEditarOcorrencia />);
    expect(await screen.findByText("Não foi possível consultar a ocorrência. Verifique a conexão e tente novamente.")).toBeOnTheScreen();
  });
});
