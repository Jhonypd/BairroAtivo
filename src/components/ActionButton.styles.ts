import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import type { ButtonSize } from "./button.types";

export const actionButtonStyles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 12,
  },
  primary: { borderColor: colors.primary, backgroundColor: colors.primary },
  outline: { borderColor: colors.borderEmphasis, backgroundColor: colors.surface },
  icon: { paddingHorizontal: 0, backgroundColor: "transparent", borderColor: "transparent" },
  pressed: { opacity: 0.78 },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  iconOnlyContent: { gap: 0 },
  iconSlot: { alignItems: "center", justifyContent: "center" },
  label: { color: colors.surface, fontWeight: "700" },
  outlineLabel: { color: colors.primary },
});

type ButtonSizeStyle = {
  button: ViewStyle;
  label: TextStyle;
  iconButton: ViewStyle;
  icon: ViewStyle;
};

export const buttonSizeStyles: Record<ButtonSize, ButtonSizeStyle> = {
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
