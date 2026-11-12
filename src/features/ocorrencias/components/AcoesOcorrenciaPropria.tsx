import { useState } from "react";
import { router } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCarregamentoGlobal } from "@/shared/components/ui/CarregamentoGlobal";
import { cores } from "@/configs/tema";
import IconeLapiz from "@/shared/icons/pencil.svg";
import IconeLixeira from "@/shared/icons/trash-2.svg";
import IconeChevron from "@/shared/icons/chevron-right.svg";
import IconeFechar from "@/shared/icons/x.svg";
import { excluirOcorrencia } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";

type Propriedades = {
  ocorrencia: Ocorrencia | null;
  aoFechar: () => void;
  aoExcluir: (id: string) => void;
};

type ModoAcoes = "acoes" | "confirmar-exclusao";

export function AcoesOcorrenciaPropria({ ocorrencia, aoFechar, aoExcluir }: Propriedades) {
  const insets = useSafeAreaInsets();
  const { executarComCarregamento } = useCarregamentoGlobal();
  const [modo, definirModo] = useState<ModoAcoes>("acoes");
  const [excluindo, definirExcluindo] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);

  function fechar() {
    definirModo("acoes");
    definirErro(null);
    aoFechar();
  }

  function editar() {
    if (!ocorrencia) return;
    const id = ocorrencia.id;
    fechar();
    router.push({ pathname: "/ocorrencias/editar/[id]", params: { id } } as never);
  }

  async function confirmarExclusao() {
    if (!ocorrencia || excluindo) return;
    definirExcluindo(true);
    definirErro(null);
    try {
      await executarComCarregamento(
        () => excluirOcorrencia(ocorrencia.id),
        "Excluindo ocorrência",
      );
      aoExcluir(ocorrencia.id);
      fechar();
    } catch (falha) {
      definirErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível excluir a ocorrência. Verifique a conexão e tente novamente.",
      );
    } finally {
      definirExcluindo(false);
    }
  }

  return (
    <Modal
      visible={Boolean(ocorrencia)}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => undefined}
    >
      <View style={styles.modal}>
        <View style={styles.areaSheet}>
          <View
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}
            accessibilityViewIsModal
          >
            <View style={styles.indicadorArraste} />
            {modo === "acoes" ? (
              <>
                <View style={styles.cabecalho}>
                  <View style={styles.titulos}>
                    <Text style={styles.sobretitulo}>Ações da ocorrência</Text>
                    <Text numberOfLines={2} style={styles.titulo}>{ocorrencia?.titulo}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Fechar menu"
                    onPress={fechar}
                    hitSlop={8}
                    style={({ pressed }) => [styles.botaoFechar, pressed && styles.pressionado]}
                  >
                    <IconeFechar width={18} height={18} />
                  </Pressable>
                </View>
                <View style={styles.divisor} />
                <Pressable
                  accessibilityRole="button"
                  onPress={editar}
                  style={({ pressed }) => [styles.acao, pressed && styles.pressionado]}
                >
                  <View style={styles.iconeEditar}>
                    <IconeLapiz width={19} height={19} />
                  </View>
                  <View style={styles.textoAcao}>
                    <Text style={styles.tituloAcao}>Editar ocorrência</Text>
                    <Text style={styles.descricaoAcao}>Atualize as informações do relato</Text>
                  </View>
                  <IconeChevron width={19} height={19} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    definirErro(null);
                    definirModo("confirmar-exclusao");
                  }}
                  style={({ pressed }) => [styles.acao, pressed && styles.pressionado]}
                >
                  <View style={styles.iconeExcluir}>
                    <IconeLixeira width={19} height={19} />
                  </View>
                  <View style={styles.textoAcao}>
                    <Text style={styles.tituloExcluir}>Excluir ocorrência</Text>
                    <Text style={styles.descricaoAcao}>Remova este relato permanentemente</Text>
                  </View>
                  <IconeChevron width={19} height={19} />
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.cabecalho}>
                  <View style={styles.titulos}>
                    <Text style={styles.sobretitulo}>Confirmar exclusão</Text>
                    <Text numberOfLines={2} style={styles.titulo}>{ocorrencia?.titulo}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Fechar confirmação"
                    onPress={fechar}
                    hitSlop={8}
                    style={({ pressed }) => [styles.botaoFechar, pressed && styles.pressionado]}
                  >
                    <IconeFechar width={18} height={18} />
                  </Pressable>
                </View>
                <View style={styles.divisor} />
                <Text style={styles.avisoExclusao}>
                  Esta ação não poderá ser desfeita. Tem certeza de que deseja excluir esta ocorrência?
                </Text>
                {erro ? <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text> : null}
                <View style={styles.botoesConfirmacao}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      definirErro(null);
                      definirModo("acoes");
                    }}
                    disabled={excluindo}
                    style={({ pressed }) => [styles.botaoCancelar, pressed && styles.pressionado]}
                  >
                    <Text style={styles.textoCancelar}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void confirmarExclusao()}
                    disabled={excluindo}
                    style={({ pressed }) => [styles.botaoConfirmarExclusao, pressed && styles.pressionado, excluindo && styles.desabilitado]}
                  >
                    <IconeLixeira width={17} height={17} />
                    <Text style={styles.textoConfirmarExclusao}>
                      {excluindo ? "Excluindo…" : "Excluir ocorrência"}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 25, 19, 0.52)" },
  areaSheet: { width: "100%", alignItems: "center" },
  sheet: {
    width: "100%",
    maxWidth: 520,
    paddingHorizontal: 18,
    paddingTop: 9,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: cores.surface,
  },
  indicadorArraste: { width: 38, height: 4, alignSelf: "center", marginBottom: 12, borderRadius: 2, backgroundColor: "#D8E0D8" },
  cabecalho: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingBottom: 12 },
  titulos: { flex: 1, minWidth: 0, gap: 4 },
  sobretitulo: { color: cores.textSubtle, fontSize: 11 },
  titulo: { color: cores.primaryDark, fontSize: 16, fontWeight: "600" },
  botaoFechar: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#F0F4F1" },
  divisor: { height: 1, marginBottom: 5, backgroundColor: cores.borderSoft },
  acao: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 2 },
  iconeEditar: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#EAF4EE" },
  iconeExcluir: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#FFF0EE" },
  textoAcao: { flex: 1, minWidth: 0, gap: 3 },
  tituloAcao: { color: cores.primaryDark, fontSize: 13, fontWeight: "700" },
  tituloExcluir: { color: cores.error, fontSize: 13, fontWeight: "700" },
  descricaoAcao: { color: cores.textSubtle, fontSize: 11 },
  botoesConfirmacao: { flexDirection: "row", gap: 10, marginTop: 14 },
  avisoExclusao: { marginTop: 11, color: cores.textMuted, fontSize: 14, lineHeight: 21 },
  erro: { marginTop: 8, color: cores.error, fontSize: 12, lineHeight: 18 },
  botaoCancelar: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#F0F4F1" },
  textoCancelar: { color: cores.primaryDark, fontSize: 14, fontWeight: "700" },
  botaoConfirmarExclusao: { flex: 1.4, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 12, backgroundColor: cores.error },
  textoConfirmarExclusao: { color: cores.surface, fontSize: 13, fontWeight: "700" },
  desabilitado: { opacity: 0.6 },
  pressionado: { opacity: 0.78 },
});
