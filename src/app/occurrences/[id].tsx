import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { ActionButton } from "../../components/ActionButton";
import { occurrences } from "../../domain/occurrences";
import { occurrenceDetailsStyles as styles } from "../../styles/screens/occurrenceDetails.styles";

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return occurrences.map(({ id }) => ({ id }));
}

export default function OccurrenceDetailsScreen() {
  const { id: routeId } = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(routeId) ? routeId[0] : routeId;
  const occurrence = occurrences.find((item) => item.id === id);

  if (!occurrence) {
    return (
      <>
        <Stack.Screen options={{ title: "Ocorrência" }} />
        <View style={styles.notFound}>
          <ActionButton
            label="Voltar às ocorrências"
            href="/occurrences"
            replace
            variant="outline"
            size="sm"
          />
          <Text style={styles.title}>Nenhuma ocorrência encontrada</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Detalhes da ocorrência" }} />
      <ScrollView contentContainerStyle={styles.container}>
        <ActionButton
          label="Voltar às ocorrências"
          href="/occurrences"
          replace
          variant="outline"
          size="sm"
        />
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
        <Text style={styles.disclaimer}>
          Este é um registro demonstrativo. O status não indica atendimento
          oficial.
        </Text>
      </ScrollView>
    </>
  );
}
