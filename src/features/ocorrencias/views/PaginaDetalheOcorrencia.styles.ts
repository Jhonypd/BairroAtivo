import { StyleSheet } from "react-native";
import { cores } from "@/configs/tema";

export const paginaDetalheOcorrenciaStyles = StyleSheet.create({
  container: { padding: 22, paddingBottom: 36, gap: 18 },
  notFound: {
    flex: 1,
    padding: 22,
    justifyContent: "flex-start",
    alignItems: "stretch",
    gap: 16,
  },
  categoria: { color: cores.primary, fontSize: 14, fontWeight: "700" },
  titulo: { color: cores.primaryDark, fontSize: 28, lineHeight: 36, fontWeight: "700" },
  infoCard: { padding: 20, borderRadius: 20, backgroundColor: cores.surface, gap: 8 },
  descriptionCard: { padding: 20, borderRadius: 20, backgroundColor: cores.surfaceSoft, gap: 10 },
  label: { color: cores.textMuted, fontSize: 13, fontWeight: "600" },
  value: { color: cores.primaryDark, fontSize: 16, fontWeight: "700", marginBottom: 8 },
  status: { alignSelf: "flex-start", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, backgroundColor: cores.surfaceSoft, fontSize: 13, fontWeight: "700" },
  descricao: { color: cores.text, fontSize: 16, lineHeight: 25 },
  disclaimer: { color: cores.textSubtle, fontSize: 13, lineHeight: 20 },
});






