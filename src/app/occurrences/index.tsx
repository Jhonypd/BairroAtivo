import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton } from "../../components/ActionButton";
import { OccurrenceCard } from "../../components/OccurrenceCard";
import { occurrences } from "../../domain/occurrences";

export default function OccurrencesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.intro}>
        <Text style={styles.title}>O que está acontecendo por perto?</Text>
        <Text style={styles.description}>Relatos simulados para conhecer a experiência do BairroAtivo.</Text>
      </View>
      <View style={styles.list}>
        {occurrences.map((occurrence) => <OccurrenceCard key={occurrence.id} occurrence={occurrence} />)}
      </View>
      <ActionButton label="Registrar uma ocorrência" href="/create" secondary />
      <Text style={styles.disclaimer}>Os registros exibidos são fictícios.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 36, gap: 20 },
  intro: { gap: 8 },
  title: { color: "#183B2B", fontSize: 25, fontWeight: "700", lineHeight: 32 },
  description: { color: "#66736A", fontSize: 15, lineHeight: 22 },
  list: { gap: 12 },
  disclaimer: { color: "#748078", fontSize: 12, textAlign: "center" },
});
