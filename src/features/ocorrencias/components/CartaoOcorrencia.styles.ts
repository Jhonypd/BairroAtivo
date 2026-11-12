import { StyleSheet } from "react-native";
import { cores } from "@/configs/tema";

export const cartaoOcorrenciaStyles = StyleSheet.create({
  card: {
    padding: 0,
    borderRadius: 16,
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.borderSoft,
    overflow: "hidden",
    shadowColor: "#183B2B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  conteudoClicavel: { padding: 13, gap: 9, borderRadius: 15 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
  hovered: {
    borderColor: cores.borderEmphasis,
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 3,
    transform: [{ translateY: -2 }],
  },
  focused: { borderColor: cores.primary, borderWidth: 2 },
  topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  topLineComOpcoes: { paddingRight: 78 },
  botaoOpcoes: { position: "absolute", top: 10, right: 12, minHeight: 29, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3, paddingHorizontal: 7, borderRadius: 9, backgroundColor: "#F7F9F7", borderWidth: 1, borderColor: cores.border, zIndex: 2 },
  textoOpcoes: { color: cores.text, fontSize: 10, fontWeight: "600" },
  categoria: { flex: 1, minWidth: 0, color: cores.textMuted, fontSize: 11, fontWeight: "600" },
  status: { flexShrink: 0, overflow: "hidden", paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, fontSize: 10, fontWeight: "700", maxWidth: "48%" },
  statusComOpcoes: { maxWidth: 140 },
  body: { flexDirection: "row", alignItems: "center", gap: 10 },
  conteudo: { flex: 1, minWidth: 0, gap: 5 },
  titulo: { color: cores.primaryDark, fontSize: 16, fontWeight: "700", lineHeight: 21 },
  localizacao: { flexDirection: "row", alignItems: "center", gap: 5, minWidth: 0 },
  bairro: { flex: 1, minWidth: 0, color: cores.textMuted, fontSize: 13 },
  autor: { color: cores.textSubtle, fontSize: 11 },
  imagem: { width: 82, height: 72, flexShrink: 0, borderRadius: 11, backgroundColor: cores.surfaceSoft },
  imagemVazia: { width: 82, height: 72, flexShrink: 0, borderRadius: 11, backgroundColor: cores.background, borderWidth: 1, borderColor: cores.borderSoft },
  divisor: { height: 1, marginHorizontal: -13, backgroundColor: cores.borderSoft },
  rodape: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  data: { flex: 1, minWidth: 0, color: cores.textSubtle, fontSize: 10 },
  contadorApoios: { flexDirection: "row", alignItems: "center", gap: 3, flexShrink: 0 },
  textoContadorApoios: { color: cores.textSubtle, fontSize: 10, fontWeight: "600" },
  acao: { flexDirection: "row", alignItems: "center", gap: 3, flexShrink: 0 },
  more: { color: cores.primary, fontSize: 12, fontWeight: "700" },
  seta: { color: cores.primary, fontSize: 17, lineHeight: 19, marginTop: -1 },
  setaSobrevoada: { transform: [{ translateX: 2 }] },
});






