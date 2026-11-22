import { render, screen } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import PaginaInicial from "./PaginaInicial";
import { useAutenticacao } from "@/features/autenticacao/contexto/AutenticacaoProvider";
import { listarOcorrencias } from "@/features/ocorrencias/services/ocorrenciasSupabase";
import { buscarCidadeDoUsuario, ehSchemaCidadeIndisponivel, obterCidadePublicaPadrao } from "@/shared/services/cidadesSupabase";
import type { Ocorrencia } from "@/features/ocorrencias/types/Ocorrencia";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock("@/features/autenticacao/contexto/AutenticacaoProvider", () => ({ useAutenticacao: jest.fn() }));
jest.mock("@/features/ocorrencias/services/ocorrenciasSupabase", () => ({ listarOcorrencias: jest.fn() }));
jest.mock("@/shared/services/cidadesSupabase", () => ({
  buscarCidadeDoUsuario: jest.fn(),
  ehSchemaCidadeIndisponivel: jest.fn(() => false),
  obterCidadePublicaPadrao: jest.fn(),
}));
jest.mock("@/features/ocorrencias/components/CartaoOcorrencia", () => {
  const { Text } = jest.requireActual<typeof import("react-native")>("react-native");
  return { CartaoOcorrencia: ({ ocorrencia }: { ocorrencia: Ocorrencia }) => <Text>{ocorrencia.titulo}</Text> };
});
jest.mock("@/shared/components/NavegacaoInferior", () => ({ NavegacaoInferior: () => null }));
jest.mock("@/shared/icons/assignment_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/add_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));
jest.mock("@/shared/icons/notifications_24dp_E3E3E3.svg", () => ({ __esModule: true, default: () => null }));

const recentes: Ocorrencia[] = [
  { id: "1", titulo: "Buraco na rua", descricao: "Cratera", categoria: "Buraco na via", bairro: "Centro", status: "Aberta", registradaEm: "hoje" },
  { id: "2", titulo: "Lâmpada apagada", descricao: "Poste sem luz", categoria: "Iluminação pública", bairro: "Guarani", status: "Aberta", registradaEm: "hoje" },
];

describe("ocorrências recentes na página inicial", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAutenticacao).mockReturnValue({ usuario: null, carregando: false } as never);
    jest.mocked(buscarCidadeDoUsuario).mockResolvedValue(null);
    jest.mocked(obterCidadePublicaPadrao).mockResolvedValue({ codigoIbge: 4202909, nome: "Brusque", uf: "SC" });
    jest.mocked(listarOcorrencias).mockResolvedValue(recentes);
  });

  it("carrega e mostra os relatos mais recentes da cidade padrão", async () => {
    await render(<PaginaInicial />);

    expect(await screen.findByText("Buraco na rua")).toBeOnTheScreen();
    expect(screen.getByText("Lâmpada apagada")).toBeOnTheScreen();
    expect(listarOcorrencias).toHaveBeenCalledWith({ cidadeIbge: 4202909 });
  });

  it("continua mostrando relatos quando o banco ainda não tem o catálogo de cidades", async () => {
    jest.mocked(obterCidadePublicaPadrao).mockRejectedValue(new Error("schema antigo"));
    jest.mocked(ehSchemaCidadeIndisponivel).mockReturnValue(true);

    await render(<PaginaInicial />);

    expect(await screen.findByText("Buraco na rua")).toBeOnTheScreen();
    expect(listarOcorrencias).toHaveBeenCalledWith();
  });
});
