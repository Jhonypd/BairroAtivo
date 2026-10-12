import { ScrollView, Text, View } from "react-native";
import { ActionButton } from "../../components/ActionButton";
import { OccurrenceCard } from "../../components/OccurrenceCard";
import { occurrences } from "../../domain/occurrences";
import { occurrencesStyles as styles } from "../../styles/screens/occurrences.styles";

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
