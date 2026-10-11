import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
        <View style={styles.eyebrowWrap}>
          <Text style={styles.eyebrow}>CUIDAR DO BAIRRO COMEÇA AQUI</Text>
        </View>
        <Text style={styles.title}>Seu bairro,{"\n"}mais ativo.</Text>
        <Text style={styles.subtitle}>Uma comunidade melhor começa com a participação de todos.</Text>
        <Text style={styles.description}>Consulte problemas do seu bairro e acompanhe os relatos da comunidade.</Text>
        <ActionButton label="Consultar ocorrências" href="/occurrences/index" />
        <ActionButton label="Registrar uma ocorrência" href="/create" secondary />
      </View>
      <View style={styles.notice}>
        <Text style={styles.noticeMark}>i</Text>
        <View style={styles.noticeCopy}>
          <Text style={styles.noticeTitle}>Um projeto comunitário</Text>
        <Text style={styles.noticeText}>O BairroAtivo não é um serviço oficial da prefeitura. Os status são informativos e não representam atendimento oficial.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 38, paddingBottom: 36, gap: 18, backgroundColor: "#F7F8F4" },
  hero: { width: "100%", maxWidth: 760, alignSelf: "center", padding: 28, borderRadius: 28, backgroundColor: "#E8F0E8", gap: 16 },
  eyebrowWrap: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#D4E6D8" },
  eyebrow: { color: "#176B4D", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  title: { color: "#183B2B", fontSize: 44, lineHeight: 49, fontWeight: "800" },
  subtitle: { maxWidth: 560, color: "#294A38", fontSize: 20, lineHeight: 29, fontWeight: "600" },
  description: { maxWidth: 560, color: "#526359", fontSize: 16, lineHeight: 24, marginBottom: 4 },
  notice: { width: "100%", maxWidth: 760, alignSelf: "center", flexDirection: "row", alignItems: "flex-start", padding: 18, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E4E9E3", gap: 12 },
  noticeMark: { width: 24, height: 24, overflow: "hidden", borderRadius: 12, backgroundColor: "#E9F0E9", color: "#176B4D", fontWeight: "800", textAlign: "center", lineHeight: 24 },
  noticeCopy: { flex: 1, gap: 5 },
  noticeTitle: { color: "#183B2B", fontSize: 15, fontWeight: "700" },
  noticeText: { color: "#526359", fontSize: 13, lineHeight: 20 },
});
