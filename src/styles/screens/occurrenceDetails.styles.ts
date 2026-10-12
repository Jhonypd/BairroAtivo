import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const occurrenceDetailsStyles = StyleSheet.create({
  container: { padding: 22, paddingBottom: 36, gap: 18 },
  notFound: {
    flex: 1,
    padding: 22,
    justifyContent: "flex-start",
    alignItems: "stretch",
    gap: 16,
  },
  backButton: { alignSelf: "flex-start", minHeight: 44, paddingHorizontal: 14, borderRadius: 12 },
  category: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  title: { color: colors.primaryDark, fontSize: 28, lineHeight: 36, fontWeight: "700" },
  infoCard: { padding: 20, borderRadius: 20, backgroundColor: colors.surface, gap: 8 },
  descriptionCard: { padding: 20, borderRadius: 20, backgroundColor: colors.surfaceSoft, gap: 10 },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  value: { color: colors.primaryDark, fontSize: 16, fontWeight: "700", marginBottom: 8 },
  description: { color: colors.text, fontSize: 16, lineHeight: 25 },
  disclaimer: { color: colors.textSubtle, fontSize: 13, lineHeight: 20 },
});
