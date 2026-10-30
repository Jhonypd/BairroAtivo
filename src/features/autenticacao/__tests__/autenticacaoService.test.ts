import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { entrarComGoogle } from "../services/autenticacao";
import { supabase } from "@/configs/supabase";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

let mockExecutionEnvironment = "standalone";

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { get executionEnvironment() { return mockExecutionEnvironment; } },
}));

jest.mock("@/configs/supabase", () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      exchangeCodeForSession: jest.fn(),
    },
  },
}));
jest.mock("expo-linking", () => ({
  createURL: jest.fn(() => "bairroativo://auth/callback"),
  parse: jest.fn(() => ({ queryParams: { code: "codigo-retornado" } })),
}));
jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

const autenticar = jest.mocked(supabase!.auth.signInWithOAuth);
const trocarCodigo = jest.mocked(supabase!.auth.exchangeCodeForSession);
const abrirNavegador = jest.mocked(WebBrowser.openAuthSessionAsync);
const criarUrl = jest.mocked(Linking.createURL);

describe("login Google via Supabase Auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecutionEnvironment = "standalone";
  });

  it("explica que o login OAuth exige development build quando roda no Expo Go", async () => {
    mockExecutionEnvironment = "storeClient";

    await expect(entrarComGoogle()).rejects.toThrow(/development build/i);
    expect(autenticar).not.toHaveBeenCalled();
    expect(abrirNavegador).not.toHaveBeenCalled();
  });

  it("abre o OAuth com retorno ao deep link e troca o código por uma sessão", async () => {
    const sessao = { user: { id: "usuario-1" } } as unknown as import("@supabase/supabase-js").Session;
    autenticar.mockResolvedValue({ data: { url: "https://supabase.test/oauth" }, error: null } as never);
    abrirNavegador.mockResolvedValue({ type: "success", url: "bairroativo://auth/callback?code=codigo-retornado" } as never);
    trocarCodigo.mockResolvedValue({ data: { session: sessao, user: sessao.user }, error: null } as never);

    await expect(entrarComGoogle()).resolves.toEqual({ tipo: "autenticado", sessao });
    expect(autenticar).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "bairroativo://auth/callback", skipBrowserRedirect: true },
    });
    expect(criarUrl).toHaveBeenCalledWith("auth/callback", { scheme: "bairroativo" });
    expect(abrirNavegador).toHaveBeenCalledWith("https://supabase.test/oauth", "bairroativo://auth/callback");
    expect(trocarCodigo).toHaveBeenCalledWith("codigo-retornado");
  });

  it("trata o fechamento do navegador como cancelamento", async () => {
    autenticar.mockResolvedValue({ data: { url: "https://supabase.test/oauth" }, error: null } as never);
    abrirNavegador.mockResolvedValue({ type: "cancel" } as never);
    await expect(entrarComGoogle()).resolves.toEqual({ tipo: "cancelado" });
    expect(trocarCodigo).not.toHaveBeenCalled();
  });

  it("propaga uma falha de autenticação", async () => {
    autenticar.mockResolvedValue({ data: { url: null }, error: new Error("OAuth indisponível") } as never);
    await expect(entrarComGoogle()).rejects.toThrow("OAuth indisponível");
  });
});
