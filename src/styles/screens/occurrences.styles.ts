import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const occurrencesStyles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 36, gap: 20 },
  intro: { gap: 8 },
  title: { color: colors.primaryDark, fontSize: 25, fontWeight: "700", lineHeight: 32 },
  description: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  list: { gap: 12 },
  disclaimer: { color: colors.textSubtle, fontSize: 12, textAlign: "center" },
});
