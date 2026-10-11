import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton } from "../components/ActionButton";

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
        <Pressable accessibilityRole="button" onPress={() => { setSubmitted(false); router.replace("/occurrences/index"); }} style={styles.submit}>
          <Text style={styles.submitText}>Voltar às ocorrências</Text>
        </Pressable>
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
        <TextInput value={title} onChangeText={setTitle} placeholder="Ex.: Buraco na calçada" placeholderTextColor="#89948D" style={styles.input} maxLength={80} accessibilityLabel="Título da ocorrência" />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput value={description} onChangeText={setDescription} placeholder="Descreva o que aconteceu" placeholderTextColor="#89948D" style={[styles.input, styles.multiline]} multiline textAlignVertical="top" maxLength={500} accessibilityLabel="Descrição da ocorrência" />
      </View>
      <OptionGroup label="Categoria" options={categories} value={category} onSelect={setCategory} />
      <OptionGroup label="Bairro" options={neighborhoods} value={neighborhood} onSelect={setNeighborhood} />

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" onPress={submitForm} style={({ pressed }) => [styles.submit, pressed && styles.pressed]}>
        <Text style={styles.submitText}>Revisar preenchimento</Text>
      </Pressable>
      <ActionButton label="Voltar ao início" href="/" secondary />
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
            <Pressable key={option} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => onSelect(option)} style={[styles.option, selected && styles.optionSelected]}>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 36, gap: 18 },
  confirmation: { flex: 1, padding: 24, justifyContent: "center", gap: 18 },
  eyebrow: { color: "#176B4D", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  intro: { gap: 8, marginBottom: 2 },
  title: { color: "#183B2B", fontSize: 25, lineHeight: 32, fontWeight: "700" },
  description: { color: "#66736A", fontSize: 14, lineHeight: 21 },
  field: { gap: 9 },
  label: { color: "#183B2B", fontSize: 15, fontWeight: "700" },
  input: { minHeight: 54, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: "#D8E0D8", backgroundColor: "#FFFFFF", color: "#183B2B", fontSize: 16 },
  multiline: { minHeight: 120, paddingTop: 14 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: { paddingVertical: 11, paddingHorizontal: 14, borderWidth: 1, borderColor: "#D8E0D8", borderRadius: 999, backgroundColor: "#FFFFFF" },
  optionSelected: { borderColor: "#176B4D", backgroundColor: "#E3F0E8" },
  optionText: { color: "#526359", fontSize: 14, fontWeight: "600" },
  optionTextSelected: { color: "#176B4D" },
  error: { color: "#A33131", fontSize: 14, lineHeight: 20 },
  submit: { minHeight: 54, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#176B4D" },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.78 },
});
