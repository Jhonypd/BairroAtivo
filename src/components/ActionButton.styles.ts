import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export const actionButtonStyles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.borderEmphasis,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.78 },
  label: { color: colors.surface, fontSize: 16, fontWeight: "700" },
  secondaryLabel: { color: colors.primary },
});
