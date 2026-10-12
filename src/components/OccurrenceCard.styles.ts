import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export const occurrenceCardStyles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 8,
  },
  pressed: { opacity: 0.8 },
  topLine: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  category: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  status: { fontSize: 12, fontWeight: "700" },
  title: { color: colors.primaryDark, fontSize: 18, fontWeight: "700", lineHeight: 24 },
  neighborhood: { color: colors.textMuted, fontSize: 14 },
  more: { marginTop: 4, color: colors.primary, fontSize: 14, fontWeight: "700" },
});
