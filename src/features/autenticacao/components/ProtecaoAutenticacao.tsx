import type { PropsWithChildren } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { cores } from "@/configs/tema";
import { useAutenticacao } from "../contexto/AutenticacaoProvider";

export function ProtecaoAutenticacao({ children }: PropsWithChildren) {
  const { usuario, carregando } = useAutenticacao();
  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: cores.background }}>
        <ActivityIndicator accessibilityLabel="Verificando sessão" color={cores.primary} />
      </View>
    );
  }
  if (!usuario) return <Redirect href="/login" />;
  return children;
}
