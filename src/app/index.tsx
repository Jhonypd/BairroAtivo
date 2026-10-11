import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>CUIDAR DO BAIRRO COMEÇA AQUI</Text>
        <Text style={styles.title}>BairroAtivo</Text>
        <Text style={styles.subtitle}>Uma comunidade melhor começa com a participação de todos.</Text>
        <Text style={styles.description}>Consulte problemas do seu bairro e acompanhe os relatos da comunidade.</Text>
        <ActionButton label="Consultar ocorrências" href="/occurrences/index" />
        <ActionButton label="Registrar uma ocorrência" href="/create" secondary />
      </View>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Um projeto comunitário</Text>
        <Text style={styles.noticeText}>O BairroAtivo não é um serviço oficial da prefeitura. Os status são informativos e não representam atendimento oficial.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 28, backgroundColor: "#F7F8F4" },
  hero: { gap: 18 },
  eyebrow: { color: "#176B4D", fontSize: 12, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: "#183B2B", fontSize: 40, fontWeight: "700" },
  subtitle: { color: "#405447", fontSize: 20, lineHeight: 29, fontWeight: "600" },
  description: { color: "#66736A", fontSize: 16, lineHeight: 24, marginBottom: 4 },
  notice: { padding: 18, borderRadius: 18, backgroundColor: "#E9F0E9", gap: 6 },
  noticeTitle: { color: "#183B2B", fontSize: 15, fontWeight: "700" },
  noticeText: { color: "#526359", fontSize: 13, lineHeight: 20 },
});
