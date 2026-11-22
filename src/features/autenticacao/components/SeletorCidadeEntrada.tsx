import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { cores } from "@/configs/tema";
import { useAutenticacao } from "../contexto/AutenticacaoProvider";
import { buscarCidadeDoUsuario, definirCidadeDoUsuario, ehSchemaCidadeIndisponivel, listarCidadesDisponiveis } from "@/shared/services/cidadesSupabase";
import type { Cidade } from "@/shared/services/cidadesSupabase";

type EstadoConsulta = { usuarioId: string; cidades: Cidade[]; cidade: Cidade | null; erro: string | null };

export function SeletorCidadeEntrada() {
  const { usuario, carregando } = useAutenticacao();
  const [consulta, definirConsulta] = useState<EstadoConsulta | null>(null);
  const [salvando, definirSalvando] = useState(false);
  const [tentativa, definirTentativa] = useState(0);

  useEffect(() => {
    if (carregando || !usuario?.id) return;
    let ativo = true;
    void Promise.all([buscarCidadeDoUsuario(usuario.id), listarCidadesDisponiveis()])
      .then(([cidade, cidades]) => {
        if (ativo) definirConsulta({ usuarioId: usuario.id, cidade, cidades, erro: null });
      })
      .catch((falha: unknown) => {
        if (!ativo || ehSchemaCidadeIndisponivel(falha)) return;
        definirConsulta({ usuarioId: usuario.id, cidade: null, cidades: [], erro: "Não foi possível carregar as cidades. Verifique sua conexão e tente novamente." });
      });
    return () => { ativo = false; };
  }, [carregando, tentativa, usuario?.id]);

  const estadoAtual = usuario?.id === consulta?.usuarioId ? consulta : null;
  const aberto = Boolean(!carregando && usuario && estadoAtual && !estadoAtual.cidade);

  async function selecionarCidade(codigoIbge: number) {
    if (!usuario?.id || !estadoAtual || salvando) return;
    definirSalvando(true);
    try {
      const cidade = await definirCidadeDoUsuario(usuario.id, codigoIbge);
      definirConsulta({ ...estadoAtual, cidade, erro: null });
    } catch (falha) {
      definirConsulta({ ...estadoAtual, erro: falha instanceof Error ? falha.message : "Não foi possível salvar sua cidade." });
    } finally {
      definirSalvando(false);
    }
  }

  return (
    <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => undefined}>
      <View style={{ flex: 1, justifyContent: "center", padding: 22, backgroundColor: "rgba(14, 35, 27, 0.55)" }}>
        <View accessibilityViewIsModal style={{ width: "100%", maxWidth: 480, alignSelf: "center", gap: 14, padding: 22, borderRadius: 20, backgroundColor: cores.surface }}>
          <Text style={{ color: cores.primaryDark, fontSize: 22, fontWeight: "800" }}>Qual cidade você mora?</Text>
          <Text style={{ color: cores.textMuted, lineHeight: 21 }}>Escolha sua cidade para carregarmos os bairros e as ocorrências da sua região. Você poderá continuar depois de selecionar.</Text>
          {estadoAtual?.cidades.map((cidade) => (
            <Pressable
              key={cidade.codigoIbge}
              accessibilityRole="button"
              disabled={salvando}
              onPress={() => void selecionarCidade(cidade.codigoIbge)}
              style={{ minHeight: 50, justifyContent: "center", paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: cores.border, backgroundColor: cores.background }}
            >
              <Text style={{ color: cores.primaryDark, fontSize: 16, fontWeight: "700" }}>{cidade.nome}, {cidade.uf}</Text>
            </Pressable>
          ))}
          {salvando ? <ActivityIndicator accessibilityLabel="Salvando cidade" color={cores.primary} /> : null}
          {estadoAtual?.erro ? <Text accessibilityRole="alert" style={{ color: cores.error }}>{estadoAtual.erro}</Text> : null}
          {estadoAtual?.erro ? <Pressable accessibilityRole="button" onPress={() => definirTentativa((atual) => atual + 1)}><Text style={{ color: cores.primary, fontWeight: "700" }}>Tentar novamente</Text></Pressable> : null}
          {estadoAtual && estadoAtual.cidades.length === 0 && !estadoAtual.erro ? <Text style={{ color: cores.textMuted }}>Nenhuma cidade disponível no momento.</Text> : null}
        </View>
      </View>
    </Modal>
  );
}
