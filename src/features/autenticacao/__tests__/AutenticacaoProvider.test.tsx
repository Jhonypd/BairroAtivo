import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AutenticacaoProvider, useAutenticacao } from "../contexto/AutenticacaoProvider";
import * as autenticacao from "../services/autenticacao";

jest.mock("../services/autenticacao", () => ({
  restaurarSessao: jest.fn(),
  observarSessao: jest.fn(() => jest.fn()),
  entrarComGoogle: jest.fn(),
  sair: jest.fn(),
}));

const sessao = { user: { id: "usuario-1", email: "ana@example.com", user_metadata: { name: "Ana" } } } as never;
const restaurar = jest.mocked(autenticacao.restaurarSessao);
const entrar = jest.mocked(autenticacao.entrarComGoogle);
const sair = jest.mocked(autenticacao.sair);

function Consumidor() {
  const auth = useAutenticacao();
  return (
    <>
      <Text>{auth.carregando ? "verificando" : auth.usuario ? auth.usuario.email : "visitante"}</Text>
      <Text>{auth.erro ?? "sem erro"}</Text>
      <Text>{auth.autenticando ? "autenticando" : "pronto"}</Text>
      <Pressable onPress={() => void auth.entrarComGoogle()}><Text>Entrar</Text></Pressable>
      <Pressable onPress={() => void auth.sair()}><Text>Sair</Text></Pressable>
    </>
  );
}

async function renderAuth() {
  const view = await render(<AutenticacaoProvider><Consumidor /></AutenticacaoProvider>);
  return view;
}

describe("estado global de autenticação", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    restaurar.mockResolvedValue(null);
    entrar.mockResolvedValue({ tipo: "cancelado" });
    sair.mockResolvedValue(undefined);
  });

  it("inicia como visitante depois de verificar a sessão", async () => {
    let concluirRestauracao: ((valor: null) => void) | undefined;
    restaurar.mockReturnValue(new Promise((resolve) => { concluirRestauracao = resolve; }));
    await renderAuth();
    expect(screen.getByText("verificando")).toBeOnTheScreen();
    concluirRestauracao?.(null);
    expect(await screen.findByText("visitante")).toBeOnTheScreen();
  });

  it("restaura uma sessão válida", async () => {
    restaurar.mockResolvedValue(sessao);
    await renderAuth();
    expect(await screen.findByText("ana@example.com")).toBeOnTheScreen();
  });

  it("atualiza o usuário quando a sessão muda", async () => {
    let notificar: ((novaSessao: typeof sessao | null) => void) | undefined;
    jest.mocked(autenticacao.observarSessao).mockImplementation((callback) => {
      notificar = callback;
      return jest.fn();
    });
    await renderAuth();
    notificar?.(sessao);
    expect(await screen.findByText("ana@example.com")).toBeOnTheScreen();
    notificar?.(null);
    expect(await screen.findByText("visitante")).toBeOnTheScreen();
  });

  it("trata cancelamento sem mostrar erro", async () => {
    await renderAuth();
    await fireEvent.press(screen.getByText("Entrar"));
    expect(await screen.findByText("sem erro")).toBeOnTheScreen();
  });

  it("conclui o login e disponibiliza a sessão", async () => {
    entrar.mockResolvedValue({ tipo: "autenticado", sessao });
    await renderAuth();
    await fireEvent.press(screen.getByText("Entrar"));
    expect(await screen.findByText("ana@example.com")).toBeOnTheScreen();
  });

  it("mostra erro de autenticação", async () => {
    entrar.mockRejectedValue(new Error("Falha ao autenticar"));
    await renderAuth();
    await fireEvent.press(screen.getByText("Entrar"));
    expect(await screen.findByText("Falha ao autenticar")).toBeOnTheScreen();
  });

  it("encerra a sessão no logout", async () => {
    restaurar.mockResolvedValue(sessao);
    await renderAuth();
    await fireEvent.press(screen.getByText("Sair"));
    await waitFor(() => expect(sair).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("visitante")).toBeOnTheScreen();
  });

  it("não inicia um segundo login simultâneo", async () => {
    let concluir: (() => void) | undefined;
    entrar.mockImplementation(() => new Promise((resolve) => { concluir = () => resolve({ tipo: "cancelado" }); }));
    await renderAuth();
    fireEvent.press(screen.getByText("Entrar"));
    fireEvent.press(screen.getByText("Entrar"));
    expect(entrar).toHaveBeenCalledTimes(1);
    concluir?.();
  });
});
