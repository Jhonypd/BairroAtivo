import { router, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { colors } from "../theme/colors";
import type { Occurrence } from "../types/occurrence";
import { occurrenceCardStyles as styles } from "./OccurrenceCard.styles";

const statusColors: Record<Occurrence["status"], string> = {
  Aberta: colors.statusOpen,
  "Em acompanhamento": colors.statusInProgress,
  Resolvida: colors.statusResolved,
};

export function OccurrenceCard({ occurrence }: { occurrence: Occurrence }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/occurrences/${encodeURIComponent(occurrence.id)}` as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topLine}>
        <Text style={styles.category}>{occurrence.category}</Text>
        <Text style={[styles.status, { color: statusColors[occurrence.status] }]}>
          {occurrence.status}
        </Text>
      </View>
      <Text style={styles.title}>{occurrence.title}</Text>
      <Text style={styles.neighborhood}>{occurrence.neighborhood}</Text>
      <Text style={styles.more}>Ver detalhes →</Text>
    </Pressable>
  );
}
