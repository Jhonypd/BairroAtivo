import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export const filterChipStyles = StyleSheet.create({
  chip: { minHeight: 36, justifyContent: "center", paddingHorizontal: 13, borderRadius: 999, backgroundColor: colors.surfaceSoft },
  selectedChip: { backgroundColor: colors.primary },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  selectedLabel: { color: colors.surface },
  pressed: { opacity: 0.75 },
});
