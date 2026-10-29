import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { cores } from "@/configs/tema";
import type { Ocorrencia } from "../types/Ocorrencia";
import { cartaoOcorrenciaStyles as styles } from "./CartaoOcorrencia.styles";

const coresStatus: Record<Ocorrencia["status"], { text: string; background: string }> = {
  Aberta: { text: cores.statusOpen, background: "#FCE8E6" },
  "Em acompanhamento": { text: cores.statusInProgress, background: "#FFF2CC" },
  Resolvida: { text: cores.statusResolved, background: "#E1F3E7" },
};

export function CartaoOcorrencia({ ocorrencia }: { ocorrencia: Ocorrencia }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${ocorrencia.titulo}`}
      accessibilityHint="Abre os detalhes da ocorrência"
      onPress={() => router.push({ pathname: "/ocorrencias/[id]", params: { id: ocorrencia.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topLine}>
        <Text style={styles.categoria}>{ocorrencia.categoria}</Text>
        <Text style={[styles.status, { color: coresStatus[ocorrencia.status].text, backgroundColor: coresStatus[ocorrencia.status].background }]}>
          {ocorrencia.status}
        </Text>
      </View>
      <Text style={styles.titulo}>{ocorrencia.titulo}</Text>
      <Text style={styles.bairro}>{ocorrencia.bairro}</Text>
      {ocorrencia.nomeAutorPublico ? <Text style={styles.bairro}>Por {ocorrencia.nomeAutorPublico}</Text> : null}
      <Text style={styles.more}>Ver detalhes <Text accessibilityElementsHidden>›</Text></Text>
    </Pressable>
  );
}







