import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export const occurrenceCardStyles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 8,
  },
  pressed: { opacity: 0.8 },
  topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  category: { flexShrink: 1, color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  status: { overflow: "hidden", paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, fontSize: 11, fontWeight: "700" },
  title: { color: colors.primaryDark, fontSize: 17, fontWeight: "700", lineHeight: 23 },
  neighborhood: { color: colors.textMuted, fontSize: 14 },
  more: { marginTop: 2, color: colors.primary, fontSize: 13, fontWeight: "700" },
});
