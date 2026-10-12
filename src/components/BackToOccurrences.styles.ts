import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export const backToOccurrencesStyles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderEmphasis,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.75 },
  label: { color: colors.primary, fontSize: 14, fontWeight: "700" },
});
