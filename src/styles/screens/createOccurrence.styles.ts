import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const createOccurrenceStyles = StyleSheet.create({
  container: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", padding: 20, paddingBottom: 36, gap: 18 },
  intro: { gap: 8, marginBottom: 2 },
  title: { color: colors.primaryDark, fontSize: 25, lineHeight: 32, fontWeight: "800" },
  description: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  field: { gap: 8 },
  label: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
  required: { color: colors.error },
  input: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.primaryDark,
    fontSize: 15,
  },
  placeholder: { color: colors.placeholder },
  multiline: { minHeight: 120, paddingTop: 14, paddingBottom: 14 },
  counter: { color: colors.textSubtle, fontSize: 12, textAlign: "right" },
  notice: { padding: 14, borderRadius: 12, backgroundColor: "#E8F2FA", gap: 5 },
  noticeTitle: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
  noticeText: { color: colors.text, fontSize: 13, lineHeight: 19 },
});
