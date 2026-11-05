import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { ProtecaoAutenticacao } from "@/features/autenticacao/components/ProtecaoAutenticacao";
import FormularioOcorrencia from "@/features/ocorrencias/views/FormularioOcorrencia";
import { buscarOcorrenciaPorId } from "@/features/ocorrencias/services/ocorrenciasSupabase";
import type { Ocorrencia } from "@/features/ocorrencias/types/Ocorrencia";

export default function RotaEditarOcorrencia() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ocorrencia, definirOcorrencia] = useState<Ocorrencia | null>(null);
  const [erro, definirErro] = useState(false);
  useEffect(() => {
    let ativa = true;
    void buscarOcorrenciaPorId(id).then((resultado) => { if (ativa) definirOcorrencia(resultado); }).catch(() => { if (ativa) definirErro(true); });
    return () => { ativa = false; };
  }, [id]);
  return <ProtecaoAutenticacao><>
    <Stack.Screen options={{ title: "Editar ocorrência" }} />
    {ocorrencia ? <FormularioOcorrencia ocorrenciaInicial={ocorrencia} /> : <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {erro ? <Text>Não foi possível carregar esta ocorrência.</Text> : <ActivityIndicator accessibilityLabel="Carregando ocorrência" />}
    </View>}
  </></ProtecaoAutenticacao>;
}
