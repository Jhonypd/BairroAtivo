import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const homeStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 36,
    gap: 22,
    backgroundColor: colors.background,
  },
  hero: {
    width: "100%",
    maxWidth: 740,
    alignSelf: "center",
    padding: 26,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E3E8E2",
    gap: 16,
  },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: "700", letterSpacing: 0.8 },
  title: { color: colors.primaryDark, fontSize: 32, lineHeight: 39, fontWeight: "700" },
  subtitle: { maxWidth: 560, color: colors.text, fontSize: 16, lineHeight: 24 },
  actions: { gap: 10, marginTop: 4 },
  notice: {
    width: "100%",
    maxWidth: 740,
    alignSelf: "center",
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.surfaceSoft,
    gap: 5,
  },
  noticeCopy: { gap: 5 },
  noticeTitle: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
  noticeText: { color: colors.text, fontSize: 13, lineHeight: 20 },
});
