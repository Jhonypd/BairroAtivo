import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { cores } from "@/configs/tema";
import type { TamanhoBotao } from "./botao.types";

export const botaoStyles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 12,
  },
  primary: { borderColor: cores.primary, backgroundColor: cores.primary },
  secondary: { borderColor: cores.secondary, backgroundColor: cores.secondary },
  outline: { borderColor: cores.borderEmphasis, backgroundColor: cores.surface },
  ghost: { borderColor: "transparent", backgroundColor: "transparent" },
  destructive: { borderColor: cores.destructive, backgroundColor: cores.destructive },
  icon: { paddingHorizontal: 0, backgroundColor: "transparent", borderColor: "transparent" },
  fullWidth: { alignSelf: "stretch" },
  disabled: { borderColor: cores.disabled, backgroundColor: cores.disabled },
  pressed: { opacity: 0.78 },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  iconOnlyContent: { gap: 0 },
  iconSlot: { alignItems: "center", justifyContent: "center" },
  label: { color: cores.surface, fontWeight: "700" },
  secondaryLabel: { color: cores.secondaryText },
  outlineLabel: { color: cores.primaryDark },
  ghostLabel: { color: cores.primary },
  disabledLabel: { color: cores.textSubtle },
});

type TamanhoBotaoStyle = {
  button: ViewStyle;
  label: TextStyle;
  iconButton: ViewStyle;
  icon: ViewStyle;
};

export const tamanhosBotao: Record<TamanhoBotao, TamanhoBotaoStyle> = {
  xs: {
    button: { minHeight: 32, paddingHorizontal: 10, borderRadius: 8 },
    label: { fontSize: 12 },
    iconButton: { width: 32, height: 32 },
    icon: { width: 14, height: 14 },
  },
  sm: {
    button: { minHeight: 40, paddingHorizontal: 14, borderRadius: 10 },
    label: { fontSize: 14 },
    iconButton: { width: 40, height: 40 },
    icon: { width: 16, height: 16 },
  },
  md: {
    button: { minHeight: 48, paddingHorizontal: 18, borderRadius: 12 },
    label: { fontSize: 15 },
    iconButton: { width: 48, height: 48 },
    icon: { width: 20, height: 20 },
  },
  lg: {
    button: { minHeight: 56, paddingHorizontal: 22, borderRadius: 14 },
    label: { fontSize: 16 },
    iconButton: { width: 56, height: 56 },
    icon: { width: 24, height: 24 },
  },
};


