import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { ActionButton } from "../../components/ActionButton";
import { FilterChip } from "../../components/FilterChip";
import { OccurrenceCard } from "../../components/OccurrenceCard";
import { occurrences } from "../../domain/occurrences";
import { occurrencesStyles as styles } from "../../styles/screens/occurrences.styles";

const statusFilters = ["Todas", "Aberta", "Em acompanhamento", "Resolvida"] as const;
type StatusFilter = (typeof statusFilters)[number];
const statusFilterLabels: Record<StatusFilter, string> = {
  Todas: "Todas",
  Aberta: "Abertas",
  "Em acompanhamento": "Em andamento",
  Resolvida: "Resolvidas",
};

export default function OccurrencesScreen() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todas");
  const visibleOccurrences = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return occurrences.filter((occurrence) => {
      const matchesStatus = statusFilter === "Todas" || occurrence.status === statusFilter;
      const searchableText = `${occurrence.title} ${occurrence.neighborhood} ${occurrence.category}`.toLocaleLowerCase("pt-BR");
      return matchesStatus && searchableText.includes(normalizedQuery);
    });
  }, [query, statusFilter]);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.intro}>
        <Text style={styles.title}>Relatos da comunidade</Text>
        <Text style={styles.description}>Veja o que está acontecendo nos bairros.</Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por palavra-chave..."
        placeholderTextColor={styles.placeholder.color}
        style={styles.search}
        accessibilityLabel="Buscar ocorrências"
        returnKeyType="search"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {statusFilters.map((filter) => (
          <FilterChip
            key={filter}
            label={statusFilterLabels[filter]}
            selected={statusFilter === filter}
            onPress={() => setStatusFilter(filter)}
          />
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{visibleOccurrences.length} {visibleOccurrences.length === 1 ? "ocorrência" : "ocorrências"}</Text>
      {visibleOccurrences.length > 0 ? (
        <View style={styles.list}>
          {visibleOccurrences.map((occurrence) => <OccurrenceCard key={occurrence.id} occurrence={occurrence} />)}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhuma ocorrência encontrada</Text>
          <Text style={styles.emptyDescription}>Tente outra palavra ou limpe os filtros para ver todos os relatos.</Text>
          <ActionButton
            label="Limpar busca e filtros"
            onPress={() => {
              setQuery("");
              setStatusFilter("Todas");
            }}
            variant="outline"
            size="sm"
          />
        </View>
      )}

      <ActionButton label="Registrar ocorrência" href="/access" size="lg" fullWidth />
      <ActionButton label="Voltar ao início" href="/" variant="ghost" fullWidth />
      <Text style={styles.disclaimer}>Os registros são fictícios. O BairroAtivo não é um serviço oficial da prefeitura.</Text>
    </ScrollView>
  );
}
