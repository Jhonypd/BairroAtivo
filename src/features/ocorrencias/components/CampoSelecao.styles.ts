import { StyleSheet } from "react-native";
import { cores } from "@/configs/tema";

export const campoSelecaoStyles = StyleSheet.create({
  field: { gap: 8 },
  control: { position: "relative", zIndex: 10 },
  label: { color: cores.primaryDark, fontSize: 14, fontWeight: "700" },
  trigger: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: cores.border,
    borderRadius: 12,
    backgroundColor: cores.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 8,
  },
  seletor: { flex: 1, minWidth: 0, minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  limpar: { width: 32, height: 40, alignItems: "center", justifyContent: "center", marginLeft: 2 },
  iconeLimpar: { color: cores.textMuted, fontSize: 24, lineHeight: 28, fontWeight: "400" },
  value: { color: cores.primaryDark, fontSize: 15 },
  placeholder: { color: cores.placeholder },
  chevron: { width: 7, height: 7, borderRightWidth: 1.5, borderBottomWidth: 1.5, borderColor: cores.primary, marginRight: 3 },
  options: {
    position: "absolute",
    top: 58,
    left: 0,
    right: 0,
    maxHeight: 240,
    padding: 4,
    zIndex: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: cores.border,
    borderRadius: 12,
    backgroundColor: cores.surface,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  optionsConteudo: { gap: 2 },
  semOpcoes: { color: cores.textMuted, fontSize: 14, padding: 12 },
  option: { minHeight: 44, justifyContent: "center", paddingHorizontal: 12, borderRadius: 8 },
  optionSelected: { backgroundColor: cores.selected },
  optionText: { color: cores.text, fontSize: 14 },
  optionTextSelected: { color: cores.primaryDark, fontWeight: "700" },
  pressed: { opacity: 0.75 },
});






