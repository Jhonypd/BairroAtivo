import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { colors } from "../theme/colors";
import type { Occurrence } from "../types/occurrence";
import { occurrenceCardStyles as styles } from "./OccurrenceCard.styles";

const statusColors: Record<Occurrence["status"], { text: string; background: string }> = {
  Aberta: { text: colors.statusOpen, background: "#FCE8E6" },
  "Em acompanhamento": { text: colors.statusInProgress, background: "#FFF2CC" },
  Resolvida: { text: colors.statusResolved, background: "#E1F3E7" },
};

export function OccurrenceCard({ occurrence }: { occurrence: Occurrence }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${occurrence.title}`}
      accessibilityHint="Abre os detalhes da ocorrência"
      onPress={() => router.push({ pathname: "/occurrences/[id]", params: { id: occurrence.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topLine}>
        <Text style={styles.category}>{occurrence.category}</Text>
        <Text style={[styles.status, { color: statusColors[occurrence.status].text, backgroundColor: statusColors[occurrence.status].background }]}>
          {occurrence.status}
        </Text>
      </View>
      <Text style={styles.title}>{occurrence.title}</Text>
      <Text style={styles.neighborhood}>{occurrence.neighborhood}</Text>
      <Text style={styles.more}>Ver detalhes <Text accessibilityElementsHidden>›</Text></Text>
    </Pressable>
  );
}
