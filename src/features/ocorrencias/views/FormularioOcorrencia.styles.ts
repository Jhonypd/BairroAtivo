import { StyleSheet } from "react-native";
import { cores } from "@/configs/tema";

export const formularioOcorrenciaStyles = StyleSheet.create({
  rolagem: { flex: 1 },
  container: { flexGrow: 1, width: "100%", maxWidth: 560, alignSelf: "center", padding: 20, paddingBottom: 36, gap: 18 },
  intro: { gap: 8, marginBottom: 2 },
  titulo: { color: cores.primaryDark, fontSize: 25, lineHeight: 32, fontWeight: "800" },
  descricao: { color: cores.textMuted, fontSize: 14, lineHeight: 21 },
  field: { gap: 8 },
  botoesAnexo: { flexDirection: "row", gap: 10 },
  botaoAnexo: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.border,
    backgroundColor: cores.surface,
  },
  botaoAnexoDesabilitado: { opacity: 0.6 },
  textoBotaoAnexo: { color: cores.primaryDark, fontSize: 14, fontWeight: "700" },
  ajudaAnexo: { color: cores.textMuted, fontSize: 12 },
  label: { color: cores.primaryDark, fontSize: 14, fontWeight: "700" },
  required: { color: cores.error },
  input: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.border,
    backgroundColor: cores.surface,
    color: cores.primaryDark,
    fontSize: 15,
  },
  placeholder: { color: cores.placeholder },
  multiline: { minHeight: 120, paddingTop: 14, paddingBottom: 14 },
  counter: { color: cores.textSubtle, fontSize: 12, textAlign: "right" },
  notice: { padding: 14, borderRadius: 12, backgroundColor: "#E8F2FA", gap: 5 },
  noticeTitle: { color: cores.primaryDark, fontSize: 14, fontWeight: "700" },
  noticeText: { color: cores.text, fontSize: 13, lineHeight: 19 },
});






