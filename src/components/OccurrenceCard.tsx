import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Occurrence } from "../types/occurrence";

const statusColors: Record<Occurrence["status"], string> = {
  Aberta: "#A14E25",
  "Em acompanhamento": "#6654A3",
  Resolvida: "#28734F",
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

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EBE5",
    gap: 8,
  },
  pressed: { opacity: 0.8 },
  topLine: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  category: { color: "#66736A", fontSize: 13, fontWeight: "600" },
  status: { fontSize: 12, fontWeight: "700" },
  title: { color: "#183B2B", fontSize: 18, fontWeight: "700", lineHeight: 24 },
  neighborhood: { color: "#66736A", fontSize: 14 },
  more: { marginTop: 4, color: "#176B4D", fontSize: 14, fontWeight: "700" },
});
