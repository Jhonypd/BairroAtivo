import { StyleSheet } from "react-native";
import { cores } from "@/configs/tema";

export const campoSelecaoStyles = StyleSheet.create({
  field: { gap: 8, position: "relative" },
  fieldAberto: { zIndex: 2, elevation: 8 },
  label: { color: cores.primaryDark, fontSize: 14, fontWeight: "700" },
  trigger: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: cores.border,
    borderRadius: 12,
    backgroundColor: cores.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: { color: cores.primaryDark, fontSize: 15 },
  placeholder: { color: cores.placeholder },
  chevron: { width: 7, height: 7, borderRightWidth: 1.5, borderBottomWidth: 1.5, borderColor: cores.primary, marginRight: 3 },
  options: {
    position: "absolute",
    top: 78,
    left: 0,
    right: 0,
    maxHeight: 240,
    zIndex: 3,
    elevation: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: cores.border,
    borderRadius: 12,
    backgroundColor: cores.surface,
    overflow: "hidden",
  },
  optionsConteudo: { gap: 2 },
  option: { minHeight: 44, justifyContent: "center", paddingHorizontal: 12, borderRadius: 8 },
  optionSelected: { backgroundColor: cores.selected },
  optionText: { color: cores.text, fontSize: 14 },
  optionTextSelected: { color: cores.primaryDark, fontWeight: "700" },
  pressed: { opacity: 0.75 },
});






