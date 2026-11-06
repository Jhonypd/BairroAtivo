import { StyleSheet } from "react-native";
import { cores } from "@/configs/tema";

export const ocorrenciasStyles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.background },
  cabecalhoConteudo: { width: "100%", maxWidth: 600, alignSelf: "center", paddingHorizontal: 20, paddingTop: 16, gap: 12, zIndex: 3, overflow: "visible" },
  listaOcorrencias: { flex: 1, width: "100%", maxWidth: 600, alignSelf: "center", zIndex: 0 },
  rodapeConteudo: { width: "100%", maxWidth: 600, alignSelf: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 8 },
  intro: { gap: 4 },
  eyebrow: { color: cores.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  buscaLinha: { flexDirection: "row", alignItems: "center", gap: 8 },
  buscaCampo: { flex: 1, minWidth: 0, minHeight: 48, flexDirection: "row", alignItems: "center", paddingLeft: 14, borderRadius: 14, backgroundColor: cores.surface, borderWidth: 1, borderColor: cores.border },
  seletorVisualizacao: { flexDirection: "row", gap: 8, padding: 4, borderRadius: 16, backgroundColor: "#E9F0EA" },
  abaVisualizacao: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", paddingHorizontal: 8, borderRadius: 12 },
  abaVisualizacaoAtiva: { backgroundColor: cores.primary },
  rotuloAba: { color: cores.textMuted, fontSize: 13, fontWeight: "600", textAlign: "center" },
  rotuloAbaAtiva: { color: cores.surface },
  avisoLogin: { margin: 20, padding: 20, gap: 12, borderRadius: 16, backgroundColor: cores.surface },
  titulo: { color: cores.primaryDark, fontSize: 24, fontWeight: "800", lineHeight: 31 },
  descricao: { color: cores.textMuted, fontSize: 14, lineHeight: 21 },
  search: { flex: 1, minWidth: 0, minHeight: 46, paddingRight: 12, color: cores.primaryDark, fontSize: 14 },
  botaoFiltros: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 11, borderRadius: 14, backgroundColor: cores.surface, borderWidth: 1, borderColor: cores.border },
  rotuloBotaoFiltros: { color: cores.primaryDark, fontSize: 12, fontWeight: "700" },
  contadorFiltros: { minWidth: 17, height: 17, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, borderRadius: 9, backgroundColor: cores.primary },
  contadorFiltrosTexto: { color: cores.surface, fontSize: 10, fontWeight: "700" },
  placeholder: { color: cores.placeholder },
  filtrosRolagem: { height: 40, flexGrow: 0, flexShrink: 0 },
  filters: { flexDirection: "row", alignItems: "center", gap: 8, paddingRight: 20 },
  filtrosCampos: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  filtrosCamposAberto: { zIndex: 6, elevation: 14 },
  filtroCampo: { flex: 1, minWidth: 0 },
  filtroCampoAberto: { zIndex: 4, elevation: 8 },
  filtrosAtivos: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 2 },
  filtrosAtivosTexto: { flex: 1, color: cores.textMuted, fontSize: 12 },
  editarFiltros: { color: cores.primary, fontSize: 12, fontWeight: "700" },
  painelFiltros: { padding: 14, gap: 12, borderRadius: 16, backgroundColor: cores.surface, borderWidth: 1, borderColor: cores.borderSoft },
  painelFiltrosFechado: { display: "none" },
  painelTituloLinha: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  painelTitulo: { color: cores.primaryDark, fontSize: 15, fontWeight: "700" },
  fecharFiltros: { color: cores.textMuted, fontSize: 26, lineHeight: 28 },
  acoesFiltros: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  erroAtualizacao: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, padding: 10, borderRadius: 12, backgroundColor: "#FCE8E6" },
  erroAtualizacaoTexto: { flex: 1, color: cores.error, fontSize: 12, lineHeight: 17 },
  resultCount: { color: cores.textSubtle, fontSize: 12, fontWeight: "600" },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 12, flexGrow: 1 },
  itemLista: { gap: 8 },
  emptyState: { padding: 20, borderRadius: 16, backgroundColor: cores.surface, gap: 10, alignItems: "flex-start" },
  emptySearchIcon: { color: cores.primary, fontSize: 28, lineHeight: 32 },
  emptyTitle: { color: cores.primaryDark, fontSize: 17, fontWeight: "700" },
  emptyDescription: { color: cores.textMuted, fontSize: 14, lineHeight: 20 },
  disclaimer: { color: cores.textSubtle, fontSize: 12, lineHeight: 18, textAlign: "center" },
});






