import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { router } from "expo-router";
import { cores } from "@/configs/tema";
import { concluirLoginComCodigo } from "../services/autenticacao";

type Props = { codigo?: string; descricaoErro?: string };

export function CallbackAutenticacao({ codigo, descricaoErro }: Props) {
  const [erro, definirErro] = useState<string | null>(null);

  useEffect(() => {
    if (descricaoErro || !codigo) return;

    let ativo = true;
    concluirLoginComCodigo(codigo)
      .then(() => { if (ativo) router.replace("/inicio"); })
      .catch((falha: unknown) => {
        if (ativo) definirErro(falha instanceof Error ? falha.message : "Não foi possível concluir o login.");
      });
    return () => { ativo = false; };
  }, [codigo, descricaoErro]);

  const mensagemErro = descricaoErro || (!codigo ? "O retorno do Google não contém um código de autenticação." : erro);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 24, backgroundColor: cores.background }}>
      {mensagemErro ? (
        <Text accessibilityRole="alert" style={{ color: cores.error, textAlign: "center" }}>{mensagemErro}</Text>
      ) : <ActivityIndicator accessibilityLabel="Concluindo login" color={cores.primary} size="large" />}
    </View>
  );
}
