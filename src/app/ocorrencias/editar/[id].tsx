import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Botao } from "@/shared/components/ui/Botao";
import { ProtecaoAutenticacao } from "@/features/autenticacao/components/ProtecaoAutenticacao";
import FormularioOcorrencia from "@/features/ocorrencias/views/FormularioOcorrencia";
import { buscarOcorrenciaPorId } from "@/features/ocorrencias/services/ocorrenciasSupabase";
import type { Ocorrencia } from "@/features/ocorrencias/types/Ocorrencia";

function identificadorUUIDValido(id: string | undefined): id is string {
  return typeof id === "string" && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id);
}

export default function RotaEditarOcorrencia() {
  const parametros = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(parametros.id) ? parametros.id[0] : parametros.id;
  const [ocorrencia, definirOcorrencia] = useState<Ocorrencia | null>(null);
  const [idCarregado, definirIdCarregado] = useState<string | null>(null);
  const [estado, definirEstado] = useState<"carregando" | "invalido" | "ausente" | "erro" | "pronto">("carregando");
  const uuidValido = identificadorUUIDValido(id);
  useEffect(() => {
    let ativa = true;
    if (!identificadorUUIDValido(id) || !id) return () => { ativa = false; };
    void buscarOcorrenciaPorId(id).then((resultado) => {
      if (!ativa) return;
      definirOcorrencia(resultado);
      definirEstado(resultado ? "pronto" : "ausente");
      definirIdCarregado(id);
    }).catch(() => {
      if (!ativa) return;
      definirEstado("erro");
      definirIdCarregado(id);
    });
    return () => { ativa = false; };
  }, [id]);
  const estadoAtual = !uuidValido ? "invalido" : idCarregado === id ? estado : "carregando";
  return <ProtecaoAutenticacao><>
    <Stack.Screen options={{ title: "Editar ocorrência" }} />
    {estadoAtual === "pronto" && ocorrencia ? <FormularioOcorrencia ocorrenciaInicial={ocorrencia} /> : (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: 24 }}>
        {estadoAtual === "carregando" ? <ActivityIndicator accessibilityLabel="Carregando ocorrência" /> : null}
        {estadoAtual === "invalido" ? <Text>O identificador da ocorrência é inválido.</Text> : null}
        {estadoAtual === "ausente" ? <Text>Esta ocorrência não foi encontrada ou não está disponível.</Text> : null}
        {estadoAtual === "erro" ? <Text>Não foi possível consultar a ocorrência. Verifique a conexão e tente novamente.</Text> : null}
        {estadoAtual !== "carregando" ? <Botao label="Voltar às minhas ocorrências" href={"/minhas-ocorrencias" as never} replace variant="outline" /> : null}
      </View>
    )}
  </></ProtecaoAutenticacao>;
}
