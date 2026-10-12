import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export const selectFieldStyles = StyleSheet.create({
  field: { gap: 8 },
  label: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
  trigger: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: { color: colors.primaryDark, fontSize: 15 },
  placeholder: { color: colors.placeholder },
  chevron: { color: colors.primary, fontSize: 22, lineHeight: 24 },
  options: {
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    gap: 2,
  },
  option: { minHeight: 44, justifyContent: "center", paddingHorizontal: 12, borderRadius: 8 },
  optionSelected: { backgroundColor: colors.selected },
  optionText: { color: colors.text, fontSize: 14 },
  optionTextSelected: { color: colors.primaryDark, fontWeight: "700" },
  pressed: { opacity: 0.75 },
});
