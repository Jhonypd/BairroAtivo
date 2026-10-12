import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
        <View style={styles.eyebrowRow}>
          <View style={styles.liveDot} />
          <Text style={styles.eyebrow}>COMUNIDADE EM MOVIMENTO</Text>
        </View>
        <Text style={styles.title}>Um bairro melhor{"\n"}começa com você.</Text>
        <Text style={styles.subtitle}>Veja o que acontece perto de você e acompanhe os relatos da comunidade.</Text>
        <View style={styles.actions}>
          <ActionButton label="Explorar ocorrências  →" href="/occurrences/index" light />
          <ActionButton label="Registrar um problema" href="/create" secondary light />
        </View>
        <View style={styles.highlights}>
          <View style={styles.highlight}>
            <Text style={styles.highlightTitle}>Consulta aberta</Text>
            <Text style={styles.highlightText}>Explore sem entrar</Text>
          </View>
          <View style={styles.highlightDivider} />
          <View style={styles.highlight}>
            <Text style={styles.highlightTitle}>Feito em comunidade</Text>
            <Text style={styles.highlightText}>Relatos do seu bairro</Text>
          </View>
        </View>
      </View>
      <View style={styles.notice}>
        <Text style={styles.noticeMark}>i</Text>
        <View style={styles.noticeCopy}>
          <Text style={styles.noticeTitle}>Iniciativa comunitária</Text>
          <Text style={styles.noticeText}>O BairroAtivo não é um serviço oficial da prefeitura. Os status são informativos e não representam atendimento oficial.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 32, paddingBottom: 36, gap: 16, backgroundColor: "#F7F8F4" },
  hero: { width: "100%", maxWidth: 820, alignSelf: "center", padding: 30, borderRadius: 28, backgroundColor: "#155D43", gap: 20 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 9 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#A9D6B8" },
  eyebrow: { color: "#B9DEC5", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: "#FFFFFF", fontSize: 42, lineHeight: 48, fontWeight: "800" },
  subtitle: { maxWidth: 560, color: "#E0EEE5", fontSize: 18, lineHeight: 27, fontWeight: "500" },
  actions: { gap: 10, marginTop: 2 },
  highlights: { flexDirection: "row", alignItems: "center", gap: 18, marginTop: 4, paddingTop: 18, borderTopWidth: 1, borderTopColor: "#458168" },
  highlight: { flex: 1, gap: 4 },
  highlightTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  highlightText: { color: "#B9DEC5", fontSize: 12 },
  highlightDivider: { width: 1, height: 34, backgroundColor: "#458168" },
  notice: { width: "100%", maxWidth: 820, alignSelf: "center", flexDirection: "row", alignItems: "flex-start", padding: 18, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E4E9E3", gap: 12 },
  noticeMark: { width: 24, height: 24, overflow: "hidden", borderRadius: 12, backgroundColor: "#E9F0E9", color: "#176B4D", fontWeight: "800", textAlign: "center", lineHeight: 24 },
  noticeCopy: { flex: 1, gap: 5 },
  noticeTitle: { color: "#183B2B", fontSize: 15, fontWeight: "700" },
  noticeText: { color: "#526359", fontSize: 13, lineHeight: 20 },
});
