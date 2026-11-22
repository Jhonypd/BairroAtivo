import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { cores } from "@/configs/tema";
import { Botao } from "@/shared/components/ui/Botao";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import { useAutenticacao } from "../contexto/AutenticacaoProvider";
import { buscarCidadeDoUsuario, definirCidadeDoUsuario, ehSchemaCidadeIndisponivel, listarCidadesDisponiveis } from "@/shared/services/cidadesSupabase";
import type { Cidade } from "@/shared/services/cidadesSupabase";

export default function PaginaPerfil() {
  const { usuario, carregando, autenticando, erro, sair } = useAutenticacao();
  const [erroSaida, definirErroSaida] = useState<string | null>(null);
  const [cidade, definirCidade] = useState<Cidade | null>(null);
  const [cidadesDisponiveis, definirCidadesDisponiveis] = useState<Cidade[]>([]);
  const [carregandoCidade, definirCarregandoCidade] = useState(Boolean(usuario?.id));
  const [salvandoCidade, definirSalvandoCidade] = useState(false);
  const [erroCidade, definirErroCidade] = useState<string | null>(null);
  const [alterandoCidade, definirAlterandoCidade] = useState(false);
  const nome = typeof usuario?.user_metadata.full_name === "string"
    ? usuario.user_metadata.full_name
    : typeof usuario?.user_metadata.name === "string"
      ? usuario.user_metadata.name
      : usuario?.email?.split("@")[0] ?? "Visitante";
  const foto = typeof usuario?.user_metadata.avatar_url === "string"
    ? usuario.user_metadata.avatar_url
    : typeof usuario?.user_metadata.picture === "string"
      ? usuario.user_metadata.picture
      : null;

  useEffect(() => {
    if (!usuario?.id) return;
    let ativa = true;
    Promise.all([buscarCidadeDoUsuario(usuario.id), listarCidadesDisponiveis()])
      .then(([cidadeAtual, disponiveis]) => { if (ativa) { definirCidade(cidadeAtual); definirCidadesDisponiveis(disponiveis); } })
      .catch((falha: unknown) => {
        if (!ativa) return;
        definirErroCidade(ehSchemaCidadeIndisponivel(falha)
          ? "O catálogo de cidades ainda não foi ativado no banco. Depois da atualização, a escolha aparecerá automaticamente ao entrar no app."
          : falha instanceof Error ? falha.message : "Não foi possível carregar as cidades.");
      })
      .finally(() => { if (ativa) definirCarregandoCidade(false); });
    return () => { ativa = false; };
  }, [usuario?.id]);

  async function selecionarCidade(codigoIbge: number) {
    if (!usuario?.id) return;
    definirSalvandoCidade(true); definirErroCidade(null);
    try { definirCidade(await definirCidadeDoUsuario(usuario.id, codigoIbge)); definirAlterandoCidade(false); }
    catch (falha) { definirErroCidade(falha instanceof Error ? falha.message : "Não foi possível salvar sua cidade."); }
    finally { definirSalvandoCidade(false); }
  }

  async function encerrarSessao() {
    definirErroSaida(null);
    try { await sair(); }
    catch { definirErroSaida("Não foi possível sair da conta. Tente novamente."); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: cores.background }}>
      <ScrollView contentContainerStyle={{ width: "100%", maxWidth: 600, alignSelf: "center", padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: cores.primaryDark }}>Perfil</Text>
        {carregando ? <Text accessibilityRole="progressbar">Verificando sua conta…</Text> : usuario ? (
          <View style={{ alignItems: "center", gap: 12, padding: 24, backgroundColor: cores.surface, borderRadius: 18 }}>
            {foto ? <Image source={{ uri: foto }} accessibilityLabel="Foto do perfil Google" style={{ width: 88, height: 88, borderRadius: 44 }} /> : (
              <View accessibilityLabel="Avatar do perfil" style={{ width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", backgroundColor: cores.primary }}>
                <Text style={{ color: cores.surface, fontSize: 28, fontWeight: "700" }}>{nome.charAt(0).toLocaleUpperCase("pt-BR")}</Text>
              </View>
            )}
            <Text style={{ color: cores.primaryDark, fontSize: 20, fontWeight: "700", textAlign: "center" }}>{nome}</Text>
            {usuario.email ? <Text style={{ color: cores.textMuted, textAlign: "center" }}>{usuario.email}</Text> : null}
            <View style={{ width: "100%", gap: 10, padding: 16, borderRadius: 14, backgroundColor: cores.background }}>
              <Text style={{ color: cores.primaryDark, fontSize: 16, fontWeight: "700" }}>Minha cidade</Text>
              {carregandoCidade ? <Text accessibilityRole="progressbar" style={{ color: cores.textMuted }}>Carregando cidade…</Text> : cidade && !alterandoCidade ? (
                <View style={{ gap: 8 }}>
                  <Text style={{ color: cores.textMuted }}>{cidade.nome}, {cidade.uf}</Text>
                  <Text style={{ color: cores.textMuted, fontSize: 12, lineHeight: 18 }}>Sua cidade fica vinculada ao perfil. Os bairros, relatos e mapa são filtrados por ela.</Text>
                  <Pressable accessibilityRole="button" onPress={() => definirAlterandoCidade(true)}><Text style={{ color: cores.primary, fontWeight: "700" }}>Alterar minha cidade</Text></Pressable>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  <Text style={{ color: cores.textMuted, lineHeight: 20 }}>Toque na sua cidade na lista abaixo. No primeiro acesso, esta escolha também aparece automaticamente em um popup.</Text>
                  {cidadesDisponiveis.map((opcao) => <Pressable key={opcao.codigoIbge} accessibilityRole="button" disabled={salvandoCidade} onPress={() => void selecionarCidade(opcao.codigoIbge)} style={{ minHeight: 48, justifyContent: "center", paddingHorizontal: 12, borderRadius: 10, backgroundColor: cores.surface, borderWidth: 1, borderColor: cores.border }}><Text style={{ color: cores.primaryDark, fontWeight: "700" }}>{opcao.nome}, {opcao.uf}</Text></Pressable>)}
                  {cidadesDisponiveis.length === 0 && !erroCidade ? <Text style={{ color: cores.textMuted }}>Ainda não há cidades cadastradas.</Text> : null}
                  {alterandoCidade ? <Pressable accessibilityRole="button" onPress={() => definirAlterandoCidade(false)}><Text style={{ color: cores.primary }}>Cancelar alteração</Text></Pressable> : null}
                </View>
              )}
              {erroCidade ? <Text accessibilityRole="alert" style={{ color: cores.error }}>{erroCidade}</Text> : null}
            </View>
            <Botao label={autenticando ? "Saindo…" : "Sair da conta"} onPress={() => void encerrarSessao()} disabled={autenticando} variant="outline" />
            {erro ?? erroSaida ? <Text accessibilityRole="alert" style={{ color: cores.error }}>{erroSaida ?? erro}</Text> : null}
          </View>
        ) : (
          <View style={{ gap: 12, padding: 20, backgroundColor: cores.surface, borderRadius: 18 }}>
            <Text style={{ color: cores.primaryDark, fontSize: 18, fontWeight: "700" }}>Você está navegando como visitante</Text>
            <Text style={{ color: cores.textMuted, lineHeight: 21 }}>Entre com sua conta Google para registrar e gerenciar suas ocorrências.</Text>
            <Botao label="Entrar com Google" onPress={() => router.push("/login" as never)} />
          </View>
        )}
      </ScrollView>
      <NavegacaoInferior ativa="perfil" />
    </View>
  );
}
