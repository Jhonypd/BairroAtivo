import { StyleSheet } from "react-native";
import { cores } from "@/configs/tema";

export const filtroStatusStyles = StyleSheet.create({
  chip: { minHeight: 36, justifyContent: "center", paddingHorizontal: 13, borderRadius: 999, backgroundColor: cores.surfaceSoft },
  selectedChip: { backgroundColor: cores.primary },
  label: { color: cores.textMuted, fontSize: 12, fontWeight: "600" },
  selectedLabel: { color: cores.surface },
  pressed: { opacity: 0.75 },
});






