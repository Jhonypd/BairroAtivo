import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { ActionButton } from "../../components/ActionButton";
import { occurrences } from "../../domain/occurrences";
import { occurrenceDetailsStyles as styles } from "../../styles/screens/occurrenceDetails.styles";
import { colors } from "../../theme/colors";

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
        <Text style={styles.title}>{occurrence.title}</Text>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Categoria</Text>
          <Text style={styles.value}>{occurrence.category}</Text>
          <Text style={styles.label}>Bairro</Text>
          <Text style={styles.value}>{occurrence.neighborhood}</Text>
          <Text style={styles.label}>Data do registro</Text>
          <Text style={styles.value}>{occurrence.reportedAt}</Text>
          <Text style={styles.label}>Status comunitário</Text>
          <Text style={[styles.status, { color: occurrence.status === "Aberta" ? colors.statusOpen : occurrence.status === "Resolvida" ? colors.statusResolved : colors.statusInProgress }]}>
            {occurrence.status}
          </Text>
        </View>
        <View style={styles.descriptionCard}>
          <Text style={styles.label}>Descrição</Text>
          <Text style={styles.description}>{occurrence.description}</Text>
        </View>
        <Text style={styles.disclaimer}>
          Este é um registro demonstrativo. O BairroAtivo não é um serviço oficial da prefeitura.
        </Text>
      </ScrollView>
    </>
  );
}
