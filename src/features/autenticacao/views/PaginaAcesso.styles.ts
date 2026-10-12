import { StyleSheet } from "react-native";
import { cores } from "@/configs/tema";

export const paginaAcessoStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    justifyContent: "center",
    padding: 24,
    gap: 20,
  },
  logo: { width: "78%", height: 76, alignSelf: "center", marginBottom: 4 },
  intro: { alignItems: "center", gap: 9 },
  titulo: { color: cores.primaryDark, fontSize: 25, fontWeight: "800", lineHeight: 32, textAlign: "center" },
  descricao: { maxWidth: 380, color: cores.textMuted, fontSize: 15, lineHeight: 22, textAlign: "center" },
  loginAction: { gap: 8 },
  googleMark: { color: cores.primary, fontSize: 18, fontWeight: "800" },
  helper: { color: cores.textSubtle, fontSize: 12, lineHeight: 18, textAlign: "center" },
  separator: { flexDirection: "row", alignItems: "center", gap: 12 },
  separatorLine: { height: 1, flex: 1, backgroundColor: cores.border },
  separatorText: { color: cores.textSubtle, fontSize: 13 },
});





