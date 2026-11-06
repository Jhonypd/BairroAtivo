import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Botao } from "@/shared/components/ui/Botao";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import { cores } from "@/configs/tema";
import type { Ocorrencia } from "../types/Ocorrencia";
import { excluirOcorrencia, listarMinhasOcorrencias } from "../services/ocorrenciasSupabase";
import { CartaoOcorrencia } from "../components/CartaoOcorrencia";

export function PaginaMinhasOcorrencias({ mostrarNavegacao = true }: { mostrarNavegacao?: boolean }) {
  const [ocorrencias, definirOcorrencias] = useState<Ocorrencia[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    definirCarregando(true);
    definirErro(null);
    try { definirOcorrencias(await listarMinhasOcorrencias()); }
    catch (falha) { definirErro(falha instanceof Error ? falha.message : "Não foi possível carregar suas ocorrências."); }
    finally { definirCarregando(false); }
  }, []);

  useFocusEffect(useCallback(() => { void carregar(); }, [carregar]));

  function confirmarExclusao(ocorrencia: Ocorrencia) {
    Alert.alert("Excluir ocorrência?", `A exclusão de “${ocorrencia.titulo}” é irreversível.`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => { void (async () => {
        try {
          await excluirOcorrencia(ocorrencia.id);
          definirOcorrencias((atuais) => atuais.filter(({ id }) => id !== ocorrencia.id));
          Alert.alert("Ocorrência excluída", "A ocorrência foi excluída com sucesso.");
        } catch (falha) {
          Alert.alert("Não foi possível excluir", falha instanceof Error ? falha.message : "Verifique a conexão e tente novamente.");
        }
      })(); } },
    ]);
  }

  return <View style={{ flex: 1, backgroundColor: cores.background }}>
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
      <Text style={{ fontSize: 26, fontWeight: "700", color: cores.primaryDark }}>Minhas ocorrências</Text>
      <Text style={{ color: cores.textMuted }}>Acompanhe e gerencie os registros que você criou.</Text>
      {carregando ? <Text accessibilityRole="progressbar">Carregando suas ocorrências…</Text> : null}
      {erro ? <><Text accessibilityRole="alert" style={{ color: cores.error }}>{erro}</Text><Botao label="Tentar novamente" onPress={() => void carregar()} variant="outline" /></> : null}
      {!carregando && !erro && ocorrencias.length === 0 ? <Text>Você ainda não cadastrou ocorrências.</Text> : null}
      {!carregando && !erro ? ocorrencias.map((ocorrencia) => <View key={ocorrencia.id} style={{ gap: 8 }}>
        <CartaoOcorrencia ocorrencia={ocorrencia} />
        <Text style={{ color: cores.textMuted }}>Registrada em {ocorrencia.registradaEm}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Botao label="Editar" onPress={() => router.push({ pathname: "/ocorrencias/editar/[id]", params: { id: ocorrencia.id } } as never)} variant="outline" />
          <Botao label="Excluir" onPress={() => confirmarExclusao(ocorrencia)} variant="outline" />
        </View>
      </View>) : null}
    </ScrollView>
    {mostrarNavegacao ? <NavegacaoInferior ativa="ocorrencias" /> : null}
  </View>;
}
