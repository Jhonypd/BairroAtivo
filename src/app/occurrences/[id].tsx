import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { occurrences } from "../../domain/occurrences";

export default function OccurrenceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const occurrence = occurrences.find((item) => item.id === id);

  if (!occurrence) {
    return (
      <>
        <Stack.Screen options={{ title: "Ocorrência" }} />
        <View style={styles.notFound}>
          <BackToOccurrences />
          <Text style={styles.title}>Ocorrência não encontrada</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Detalhes da ocorrência" }} />
      <ScrollView contentContainerStyle={styles.container}>
        <BackToOccurrences />
        <Text style={styles.category}>{occurrence.category}</Text>
        <Text style={styles.title}>{occurrence.title}</Text>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Bairro</Text>
          <Text style={styles.value}>{occurrence.neighborhood}</Text>
          <Text style={styles.label}>Status comunitário</Text>
          <Text style={styles.value}>{occurrence.status}</Text>
        </View>
        <View style={styles.descriptionCard}>
          <Text style={styles.label}>Descrição</Text>
          <Text style={styles.description}>{occurrence.description}</Text>
        </View>
        <Text style={styles.disclaimer}>Este é um registro demonstrativo. O status não indica atendimento oficial.</Text>
      </ScrollView>
    </>
  );
}

function BackToOccurrences() {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.replace("/occurrences/index")}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
    >
      <Text style={styles.backButtonText}>← Voltar às ocorrências</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22, paddingBottom: 36, gap: 18 },
  notFound: { flex: 1, padding: 22, justifyContent: "flex-start", alignItems: "stretch", gap: 16 },
  backButton: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", paddingHorizontal: 14, borderWidth: 1, borderColor: "#B8CCBF", borderRadius: 12, backgroundColor: "#FFFFFF" },
  pressed: { opacity: 0.75 },
  backButtonText: { color: "#176B4D", fontSize: 14, fontWeight: "700" },
  category: { color: "#176B4D", fontSize: 14, fontWeight: "700" },
  title: { color: "#183B2B", fontSize: 28, lineHeight: 36, fontWeight: "700" },
  infoCard: { padding: 20, borderRadius: 20, backgroundColor: "#FFFFFF", gap: 8 },
  descriptionCard: { padding: 20, borderRadius: 20, backgroundColor: "#E9F0E9", gap: 10 },
  label: { color: "#66736A", fontSize: 13, fontWeight: "600" },
  value: { color: "#183B2B", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  description: { color: "#405447", fontSize: 16, lineHeight: 25 },
  disclaimer: { color: "#748078", fontSize: 13, lineHeight: 20 },
});
