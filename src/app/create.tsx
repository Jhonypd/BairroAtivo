import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { ActionButton } from "../components/ActionButton";
import { SelectField } from "../components/SelectField";
import { occurrenceCategories, neighborhoods } from "../domain/occurrenceOptions";
import { createOccurrenceStyles as styles } from "../styles/screens/createOccurrence.styles";

export default function CreateOccurrenceScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.intro}>
        <Text style={styles.title}>Nova ocorrência</Text>
        <Text style={styles.description}>Descreva o problema do seu bairro. Os campos são apenas uma prévia nesta etapa.</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Título <Text style={styles.required}>*</Text></Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ex.: Buraco na rua"
          placeholderTextColor={styles.placeholder.color}
          style={styles.input}
          maxLength={100}
          accessibilityLabel="Título da ocorrência"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Descrição <Text style={styles.required}>*</Text></Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Descreva o problema com mais detalhes..."
          placeholderTextColor={styles.placeholder.color}
          style={[styles.input, styles.multiline]}
          multiline
          textAlignVertical="top"
          maxLength={500}
          accessibilityLabel="Descrição da ocorrência"
        />
        <Text style={styles.counter}>{description.length}/500</Text>
      </View>

      <SelectField
        label="Categoria *"
        placeholder="Selecione uma categoria"
        options={occurrenceCategories}
        value={category}
        onChange={setCategory}
      />
      <SelectField
        label="Bairro *"
        placeholder="Selecione um bairro"
        options={neighborhoods}
        value={neighborhood}
        onChange={setNeighborhood}
      />

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Cadastro indisponível nesta etapa</Text>
        <Text style={styles.noticeText}>O backend ainda será implementado. O que você preencher fica apenas nesta tela e não será enviado nem salvo.</Text>
      </View>

      <ActionButton label="Cadastrar ocorrência" disabled fullWidth />
      <ActionButton label="Voltar ao acesso" href="/access" variant="ghost" fullWidth />
    </ScrollView>
  );
}
