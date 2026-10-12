import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const accessStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    justifyContent: "center",
    padding: 24,
    gap: 20,
  },
  logo: { width: "78%", height: 76, alignSelf: "center", marginBottom: 4 },
  intro: { alignItems: "center", gap: 9 },
  title: { color: colors.primaryDark, fontSize: 25, fontWeight: "800", lineHeight: 32, textAlign: "center" },
  description: { maxWidth: 380, color: colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: "center" },
  loginAction: { gap: 8 },
  googleMark: { color: colors.primary, fontSize: 18, fontWeight: "800" },
  helper: { color: colors.textSubtle, fontSize: 12, lineHeight: 18, textAlign: "center" },
  separator: { flexDirection: "row", alignItems: "center", gap: 12 },
  separatorLine: { height: 1, flex: 1, backgroundColor: colors.border },
  separatorText: { color: colors.textSubtle, fontSize: 13 },
});
