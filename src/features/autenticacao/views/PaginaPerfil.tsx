import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { cores } from "@/configs/tema";
import { Botao } from "@/shared/components/ui/Botao";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import { useAutenticacao } from "../contexto/AutenticacaoProvider";

export default function PaginaPerfil() {
  const { usuario, carregando, autenticando, erro, sair } = useAutenticacao();
  const [erroSaida, definirErroSaida] = useState<string | null>(null);
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
