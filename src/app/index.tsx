import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>CONSULTA COMUNITÁRIA</Text>
        <Text style={styles.title}>Problemas no seu bairro?</Text>
        <Text style={styles.subtitle}>Consulte os relatos da comunidade ou registre um problema para conhecer o funcionamento do aplicativo.</Text>
        <View style={styles.actions}>
          <ActionButton label="Consultar ocorrências" href="/occurrences/index" />
          <ActionButton label="Testar formulário de cadastro" href="/create" secondary />
        </View>
      </View>
      <View style={styles.notice}>
        <View style={styles.noticeCopy}>
          <Text style={styles.noticeTitle}>Sobre este projeto</Text>
          <Text style={styles.noticeText}>Este é um projeto acadêmico. Os relatos são fictícios e não são enviados à prefeitura.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 56, paddingBottom: 36, gap: 22, backgroundColor: "#F7F8F4" },
  hero: { width: "100%", maxWidth: 740, alignSelf: "center", padding: 26, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3E8E2", gap: 16 },
  eyebrow: { color: "#176B4D", fontSize: 12, fontWeight: "700", letterSpacing: 0.8 },
  title: { color: "#183B2B", fontSize: 32, lineHeight: 39, fontWeight: "700" },
  subtitle: { maxWidth: 560, color: "#526359", fontSize: 16, lineHeight: 24 },
  actions: { gap: 10, marginTop: 4 },
  notice: { width: "100%", maxWidth: 740, alignSelf: "center", padding: 18, borderRadius: 16, backgroundColor: "#E9F0E9", gap: 5 },
  noticeCopy: { gap: 5 },
  noticeTitle: { color: "#183B2B", fontSize: 14, fontWeight: "700" },
  noticeText: { color: "#526359", fontSize: 13, lineHeight: 20 },
});
