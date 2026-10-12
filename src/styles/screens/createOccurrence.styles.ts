import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const createOccurrenceStyles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 36, gap: 18 },
  confirmation: { flex: 1, padding: 24, justifyContent: "center", gap: 18 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  intro: { gap: 8, marginBottom: 2 },
  title: { color: colors.primaryDark, fontSize: 25, lineHeight: 32, fontWeight: "700" },
  description: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  field: { gap: 9 },
  label: { color: colors.primaryDark, fontSize: 15, fontWeight: "700" },
  input: {
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.primaryDark,
    fontSize: 16,
  },
  placeholder: { color: colors.placeholder },
  multiline: { minHeight: 120, paddingTop: 14 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.selected },
  optionText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  optionTextSelected: { color: colors.primary },
  error: { color: colors.error, fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.78 },
});
