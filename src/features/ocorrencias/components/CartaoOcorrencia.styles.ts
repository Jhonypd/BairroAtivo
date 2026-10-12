import { StyleSheet } from "react-native";
import { cores } from "@/configs/tema";

export const cartaoOcorrenciaStyles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.borderSoft,
    gap: 8,
  },
  pressed: { opacity: 0.8 },
  topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  categoria: { flexShrink: 1, color: cores.textMuted, fontSize: 12, fontWeight: "600" },
  status: { overflow: "hidden", paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, fontSize: 11, fontWeight: "700" },
  titulo: { color: cores.primaryDark, fontSize: 17, fontWeight: "700", lineHeight: 23 },
  bairro: { color: cores.textMuted, fontSize: 14 },
  more: { marginTop: 2, color: cores.primary, fontSize: 13, fontWeight: "700" },
});






