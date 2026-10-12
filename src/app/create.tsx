import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ActionButton } from "../components/ActionButton";
import { createOccurrenceStyles as styles } from "../styles/screens/createOccurrence.styles";

const categories = ["Vias públicas", "Iluminação", "Limpeza urbana", "Outros"];
const neighborhoods = ["Centro", "Fazenda", "São Vicente", "Outro"];

export default function CreateOccurrenceScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submitForm() {
    if (!title.trim() || !description.trim() || !category || !neighborhood) {
      setError("Preencha todos os campos para continuar.");
      return;
    }

    setError("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <View style={styles.confirmation}>
        <Text style={styles.eyebrow}>FORMULÁRIO DEMONSTRATIVO</Text>
        <Text style={styles.title}>Tudo preenchido!</Text>
        <Text style={styles.description}>Os dados não foram salvos. Esta etapa apenas demonstra o formulário.</Text>
        <ActionButton label="Voltar às ocorrências" href="/occurrences/index" replace variant="outline" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.intro}>
        <Text style={styles.title}>Conte para a comunidade</Text>
        <Text style={styles.description}>Este formulário é demonstrativo e não publica nem salva os dados.</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Título</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Ex.: Buraco na calçada" placeholderTextColor={styles.placeholder.color} style={styles.input} maxLength={80} accessibilityLabel="Título da ocorrência" />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput value={description} onChangeText={setDescription} placeholder="Descreva o que aconteceu" placeholderTextColor={styles.placeholder.color} style={[styles.input, styles.multiline]} multiline textAlignVertical="top" maxLength={500} accessibilityLabel="Descrição da ocorrência" />
      </View>
      <OptionGroup label="Categoria" options={categories} value={category} onSelect={setCategory} />
      <OptionGroup label="Bairro" options={neighborhoods} value={neighborhood} onSelect={setNeighborhood} />

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <ActionButton label="Revisar preenchimento" onPress={submitForm} />
      <ActionButton label="Voltar ao início" href="/" variant="ghost" />
    </ScrollView>
  );
}

function OptionGroup({ label, options, value, onSelect }: { label: string; options: string[]; value: string; onSelect: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.options}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable key={option} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => onSelect(option)} style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
