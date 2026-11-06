import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { cores } from "@/configs/tema";
import type { Ocorrencia } from "../types/Ocorrencia";
import { cartaoOcorrenciaStyles as styles } from "./CartaoOcorrencia.styles";
import IconeLocalizacao from "@/shared/icons/location_on_24dp_E3E3E3.svg";

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
      <View style={styles.localizacao}>
        <IconeLocalizacao width={15} height={15} fill={cores.primary} accessibilityLabel="Localização" />
        <Text style={styles.bairro}>{ocorrencia.bairro}</Text>
      </View>
      {ocorrencia.nomeAutorPublico ? <Text style={styles.autor}>Por {ocorrencia.nomeAutorPublico}</Text> : null}
      <Text style={styles.more}>Ver detalhes <Text accessibilityElementsHidden>›</Text></Text>
    </Pressable>
  );
}







