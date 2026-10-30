import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import FormularioOcorrencia from "../views/FormularioOcorrencia";
import { useAutenticacao } from "@/features/autenticacao/contexto/AutenticacaoProvider";
import { cadastrarOcorrencia } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";
import { router } from "expo-router";

jest.mock("@/features/autenticacao/contexto/AutenticacaoProvider", () => ({
  useAutenticacao: jest.fn(),
}));
jest.mock("../services/ocorrenciasSupabase", () => ({
  cadastrarOcorrencia: jest.fn(),
}));
jest.mock("@/shared/components/ui/CarregamentoGlobal", () => ({
  useCarregamentoGlobal: () => ({
    executarComCarregamento: (operacao: () => Promise<unknown>) => operacao(),
  }),
}));
jest.mock("@/shared/components/NavegacaoInferior", () => ({ NavegacaoInferior: () => null }));
jest.mock("expo-router", () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock("@/shared/icons/camera_alt_24dp_E3E3E3.svg", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/shared/icons/photo_library_24dp_E3E3E3.svg", () => ({
  __esModule: true,
  default: () => null,
}));

const ocorrenciaCriada: Ocorrencia = {
  id: "ocorrencia-1",
  titulo: "Buraco no Centro",
  descricao: "Cratera grande perto da praça.",
  categoria: "Buraco na via",
  bairro: "Centro",
  status: "Aberta",
  registradaEm: "30 de out. de 2026",
};

async function preencherFormulario() {
  await fireEvent.changeText(screen.getByLabelText("Título da ocorrência"), "Buraco no Centro");
  await fireEvent.changeText(screen.getByLabelText("Descrição da ocorrência"), "Cratera grande perto da praça.");
  await fireEvent.press(screen.getByLabelText("Categoria *: Selecione uma categoria"));
  await fireEvent.press(screen.getByText("Buraco na via"));
  await fireEvent.press(screen.getByLabelText("Bairro *: Selecione um bairro"));
  await fireEvent.press(screen.getByText("Centro"));
}

describe("formulário de cadastro de ocorrência", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAutenticacao).mockReturnValue({
      usuario: {
        id: "usuario-1",
        email: "ana@example.com",
        user_metadata: { full_name: "Ana Silva" },
      },
    } as never);
  });

  it("mostra validação sem enviar campos obrigatórios vazios", async () => {
    await render(<FormularioOcorrencia />);
    await fireEvent.press(screen.getByText("Cadastrar ocorrência"));
    expect(await screen.findByText("Informe um título com pelo menos 3 caracteres.")).toBeOnTheScreen();
    expect(cadastrarOcorrencia).not.toHaveBeenCalled();
  });

  it("preserva os campos quando o Supabase retorna falha", async () => {
    jest.mocked(cadastrarOcorrencia).mockRejectedValue(
      new Error("Não foi possível cadastrar a ocorrência. Tente novamente."),
    );
    await render(<FormularioOcorrencia />);
    await preencherFormulario();
    await fireEvent.press(screen.getByText("Cadastrar ocorrência"));

    expect(await screen.findByText("Não foi possível cadastrar a ocorrência. Tente novamente.")).toBeOnTheScreen();
    expect(screen.getByLabelText("Título da ocorrência")).toHaveProp("value", "Buraco no Centro");
    expect(screen.getByLabelText("Descrição da ocorrência")).toHaveProp("value", "Cratera grande perto da praça.");
  });

  it("confirma o cadastro e oferece acesso à ocorrência publicada", async () => {
    jest.mocked(cadastrarOcorrencia).mockResolvedValue(ocorrenciaCriada);
    await render(<FormularioOcorrencia />);
    await preencherFormulario();
    await fireEvent.press(screen.getByText("Cadastrar ocorrência"));

    expect(await screen.findByText("Ocorrência cadastrada!" )).toBeOnTheScreen();
    expect(cadastrarOcorrencia).toHaveBeenCalledWith(expect.objectContaining({
      titulo: "Buraco no Centro",
      categoria: "buraco",
      bairro: "Centro",
      nomePublico: null,
    }));
    await fireEvent.press(screen.getByText("Ver detalhes"));
    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/ocorrencias/[id]",
      params: { id: "ocorrencia-1" },
    });
  });

  it("permite voltar à listagem após a confirmação", async () => {
    jest.mocked(cadastrarOcorrencia).mockResolvedValue(ocorrenciaCriada);
    await render(<FormularioOcorrencia />);
    await preencherFormulario();
    await fireEvent.press(screen.getByText("Cadastrar ocorrência"));
    expect(await screen.findByText("Ocorrência cadastrada!")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Ver ocorrências"));
    expect(router.replace).toHaveBeenCalledWith("/ocorrencias");
  });

  it("não envia duas vezes enquanto a primeira requisição está pendente", async () => {
    let concluir!: (ocorrencia: Ocorrencia) => void;
    jest.mocked(cadastrarOcorrencia).mockReturnValue(new Promise((resolve) => { concluir = resolve; }));
    await render(<FormularioOcorrencia />);
    await preencherFormulario();
    const botao = screen.getByText("Cadastrar ocorrência");
    await fireEvent.press(botao);
    await fireEvent.press(botao);

    await waitFor(() => expect(cadastrarOcorrencia).toHaveBeenCalledTimes(1));
    await act(async () => concluir(ocorrenciaCriada));
    expect(await screen.findByText("Ocorrência cadastrada!")).toBeOnTheScreen();
  });

  it("não envia nome público sem consentimento e permite exibi-lo por escolha", async () => {
    jest.mocked(cadastrarOcorrencia).mockResolvedValue(ocorrenciaCriada);
    await render(<FormularioOcorrencia />);
    await preencherFormulario();
    await fireEvent(screen.getByLabelText("Exibir meu nome publicamente"), "valueChange", true);
    await fireEvent.press(screen.getByText("Cadastrar ocorrência"));

    await waitFor(() => expect(cadastrarOcorrencia).toHaveBeenCalledWith(expect.objectContaining({
      nomePublico: "Ana Silva",
    })));
  });
});
