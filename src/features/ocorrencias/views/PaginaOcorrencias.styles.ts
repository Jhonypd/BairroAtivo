import { StyleSheet } from "react-native";
import { cores } from "@/configs/tema";

export const ocorrenciasStyles = StyleSheet.create({
  container: { flexGrow: 1, width: "100%", maxWidth: 600, alignSelf: "center", padding: 20, paddingBottom: 36, gap: 16 },
  intro: { gap: 6 },
  titulo: { color: cores.primaryDark, fontSize: 24, fontWeight: "800", lineHeight: 31 },
  descricao: { color: cores.textMuted, fontSize: 14, lineHeight: 21 },
  search: { minHeight: 48, paddingHorizontal: 16, borderRadius: 14, backgroundColor: cores.surface, borderWidth: 1, borderColor: cores.border, color: cores.primaryDark, fontSize: 14 },
  placeholder: { color: cores.placeholder },
  filters: { flexDirection: "row", gap: 8, paddingRight: 20 },
  resultCount: { color: cores.textSubtle, fontSize: 12, fontWeight: "600" },
  list: { gap: 12 },
  emptyState: { padding: 20, borderRadius: 16, backgroundColor: cores.surface, gap: 10, alignItems: "flex-start" },
  emptyTitle: { color: cores.primaryDark, fontSize: 17, fontWeight: "700" },
  emptyDescription: { color: cores.textMuted, fontSize: 14, lineHeight: 20 },
  disclaimer: { color: cores.textSubtle, fontSize: 12, lineHeight: 18, textAlign: "center" },
});






