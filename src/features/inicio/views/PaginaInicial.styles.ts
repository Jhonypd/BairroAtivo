import { StyleSheet } from "react-native";
import { cores } from "@/configs/tema";

export const paginaInicialStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.background },
  container: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 18,
  },
  logo: { width: "82%", height: 84 },
  hero: { alignItems: "center", gap: 10 },
  titulo: { color: cores.primaryDark, fontSize: 24, lineHeight: 31, fontWeight: "800", textAlign: "center" },
  subtitulo: { maxWidth: 370, color: cores.text, fontSize: 15, lineHeight: 22, textAlign: "center" },
  illustration: { width: "100%", height: 260, marginVertical: -4 },
  actions: { width: "100%", gap: 10 },
  notice: { color: cores.textSubtle, fontSize: 12, lineHeight: 18, textAlign: "center" },
});





