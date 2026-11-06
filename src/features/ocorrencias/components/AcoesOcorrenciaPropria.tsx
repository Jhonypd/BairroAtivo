import { useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import { Botao } from "@/shared/components/ui/Botao";
import { excluirOcorrencia } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";

type Props = {
  ocorrencia: Ocorrencia;
  aoExcluir: (id: string) => void;
};

export function AcoesOcorrenciaPropria({ ocorrencia, aoExcluir }: Props) {
  const [excluindo, definirExcluindo] = useState(false);

  function confirmarExclusao() {
    Alert.alert("Excluir ocorrência?", `A exclusão de “${ocorrencia.titulo}” é irreversível.`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          void (async () => {
            definirExcluindo(true);
            try {
              await excluirOcorrencia(ocorrencia.id);
              aoExcluir(ocorrencia.id);
              Alert.alert("Ocorrência excluída", "A ocorrência foi excluída com sucesso.");
            } catch (falha) {
              definirExcluindo(false);
              Alert.alert(
                "Não foi possível excluir",
                falha instanceof Error ? falha.message : "Verifique a conexão e tente novamente.",
              );
            }
          })();
        },
      },
    ]);
  }

  return (
    <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 4 }}>
      <Botao
        label="Editar"
        onPress={() => router.push({ pathname: "/ocorrencias/editar/[id]", params: { id: ocorrencia.id } } as never)}
        variant="outline"
      />
      <Botao
        label={excluindo ? "Excluindo…" : "Excluir"}
        onPress={confirmarExclusao}
        disabled={excluindo}
        variant="outline"
      />
    </View>
  );
}
