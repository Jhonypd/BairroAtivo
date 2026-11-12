import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";
import { cores } from "@/configs/tema";
import { useAutenticacao } from "@/features/autenticacao/contexto/AutenticacaoProvider";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import { Botao } from "@/shared/components/ui/Botao";
import { useCarregamentoGlobal } from "@/shared/components/ui/CarregamentoGlobal";
import IconeCategoria from "@/shared/icons/category_24dp_E3E3E3.svg";
import IconeData from "@/shared/icons/assignment_24dp_E3E3E3.svg";
import IconeDescricao from "@/shared/icons/info_24dp_E3E3E3.svg";
import IconeLocalizacao from "@/shared/icons/location_on_24dp_E3E3E3.svg";
import IconeMapa from "@/shared/icons/map_24dp_E3E3E3.svg";
import IconeFoto from "@/shared/icons/photo_library_24dp_E3E3E3.svg";
import IconeApoiar from "@/shared/icons/thumb_up_24dp_E3E3E3.svg";
import { buscarApoioOcorrencia, buscarOcorrenciaPorId, definirApoioOcorrencia } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";
import { paginaDetalheOcorrenciaStyles as styles } from "./PaginaDetalheOcorrencia.styles";

const logo = require("../../../../assets/images/logo_.png");

const estilosStatus: Record<Ocorrencia["status"], { texto: string; fundo: string; rotulo: string }> = {
  Aberta: { texto: cores.statusOpen, fundo: "#FCE8E6", rotulo: "Aberta" },
  "Em acompanhamento": { texto: "#7A5A00", fundo: "#FFF2CC", rotulo: "Em andamento" },
  Resolvida: { texto: cores.statusResolved, fundo: "#E1F3E7", rotulo: "Resolvida" },
};

function LinhaInformacao({ Icone, titulo, valor }: {
  Icone: ComponentType<SvgProps>;
  titulo: string;
  valor: string;
}) {
  return (
    <View style={styles.linhaInformacao}>
      <View style={styles.iconeInformacao}><Icone width={18} height={18} fill={cores.textMuted} /></View>
      <View style={styles.textosInformacao}>
        <Text style={styles.label}>{titulo}</Text>
        <Text style={styles.value}>{valor}</Text>
      </View>
    </View>
  );
}

export default function PaginaDetalheOcorrencia() {
  const { id: idRota } = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(idRota) ? idRota[0] : idRota;
  const { usuario, carregando: carregandoAuth, autenticando, erro: erroAuth, entrarComGoogle } = useAutenticacao();
  const usuarioId = usuario?.id;
  const [ocorrencia, definirOcorrencia] = useState<Ocorrencia | null>(null);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState(false);
  const [menuAberto, definirMenuAberto] = useState(false);
  const [apoioAtual, definirApoioAtual] = useState<{ usuarioId: string; apoiando: boolean } | null>(null);
  const [carregandoApoio, definirCarregandoApoio] = useState(Boolean(usuarioId && !carregandoAuth));
  const [erroApoio, definirErroApoio] = useState<string | null>(null);
  const consultaApoioPendente = useRef(false);
  const insets = useSafeAreaInsets();
  const { executarComCarregamento } = useCarregamentoGlobal();
  const apoiando = Boolean(usuarioId && apoioAtual?.usuarioId === usuarioId && apoioAtual.apoiando);
  const apoioEmCarregamento = Boolean(usuarioId && carregandoApoio);

  useEffect(() => {
    let ativa = true;
    if (!id) return () => { ativa = false; };
    executarComCarregamento(() => buscarOcorrenciaPorId(id), "Carregando ocorrência")
      .then((resultado) => { if (ativa) definirOcorrencia(resultado); })
      .catch(() => { if (ativa) definirErro(true); })
      .finally(() => { if (ativa) definirCarregando(false); });
    return () => { ativa = false; };
  }, [id, executarComCarregamento]);

  useEffect(() => {
    let ativa = true;
    if (!id || !usuarioId || carregandoAuth) return () => { ativa = false; };
    consultaApoioPendente.current = true;
    void Promise.resolve()
      .then(() => {
        if (!ativa) return null;
        definirCarregandoApoio(true);
        return buscarApoioOcorrencia(id);
      })
      .then((resultado) => { if (ativa && resultado !== null) definirApoioAtual({ usuarioId, apoiando: resultado }); })
      .catch(() => { if (ativa) definirErroApoio("Não foi possível verificar seu acompanhamento."); })
      .finally(() => {
        if (ativa) {
          consultaApoioPendente.current = false;
          definirCarregandoApoio(false);
        }
      });
    return () => {
      ativa = false;
      consultaApoioPendente.current = false;
    };
  }, [id, usuarioId, carregandoAuth]);

  function voltarParaOcorrencias() {
    router.replace("/ocorrencias");
  }

  function ajustarContagemApoios(incremento: number) {
    definirOcorrencia((atual) => atual
      ? { ...atual, totalApoios: Math.max(0, (atual.totalApoios ?? 0) + incremento) }
      : atual);
  }

  async function alternarAcompanhamento() {
    if (!id || (usuarioId && (carregandoApoio || consultaApoioPendente.current)) || autenticando || carregandoAuth) return;
    definirErroApoio(null);
    definirCarregandoApoio(true);
    try {
      if (!usuario) {
        const resultado = await entrarComGoogle();
        if (resultado?.tipo !== "autenticado") {
          definirErroApoio(erroAuth ?? "Entre com Google para acompanhar esta ocorrência.");
          return;
        }
        await definirApoioOcorrencia(id, true);
        definirApoioAtual({ usuarioId: resultado.sessao.user.id, apoiando: true });
        ajustarContagemApoios(1);
        return;
      }
      const vaiApoiar = !apoiando;
      await definirApoioOcorrencia(id, vaiApoiar);
      definirApoioAtual({ usuarioId: usuario.id, apoiando: vaiApoiar });
      ajustarContagemApoios(vaiApoiar ? 1 : -1);
    } catch (erro) {
      definirErroApoio(erro instanceof Error ? erro.message : "Não foi possível atualizar seu acompanhamento.");
    } finally {
      definirCarregandoApoio(false);
    }
  }

  async function abrirMapa() {
    if (!ocorrencia || typeof ocorrencia.latitude !== "number" || typeof ocorrencia.longitude !== "number") return;
    try {
      await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${ocorrencia.latitude},${ocorrencia.longitude}`);
    } catch {
      definirErroApoio("Não foi possível abrir o mapa neste dispositivo.");
    }
  }

  async function compartilhar() {
    if (!ocorrencia) return;
    definirMenuAberto(false);
    await Share.share({ message: `${ocorrencia.titulo} — ${ocorrencia.bairro}` });
  }

  const cabecalho = (
    <View style={[styles.cabecalho, { paddingTop: Math.max(insets.top, 8) }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar para ocorrências" onPress={voltarParaOcorrencias} hitSlop={8} style={styles.botaoCabecalho}>
        <Text style={styles.setaVoltar}>‹</Text>
      </Pressable>
      <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="BairroAtivo" />
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir opções" onPress={() => definirMenuAberto(true)} hitSlop={8} style={styles.botaoCabecalho}>
        <View style={styles.menuIcone}><View style={styles.menuLinha} /><View style={styles.menuLinha} /><View style={styles.menuLinha} /></View>
      </Pressable>
    </View>
  );

  if (carregando && id && !erro) return null;

  if (!id || erro || !ocorrencia) {
    return (
      <View style={styles.tela}>
        <Stack.Screen options={{ headerShown: false }} />
        {cabecalho}
        <View style={styles.notFound}>
          <Text style={styles.tituloErro}>{!id ? "Identificador da ocorrência inválido" : erro ? "Não foi possível carregar a ocorrência" : "Nenhuma ocorrência encontrada"}</Text>
          <Botao label="Voltar às ocorrências" onPress={voltarParaOcorrencias} variant="outline" size="sm" />
        </View>
        <NavegacaoInferior ativa="ocorrencias" />
      </View>
    );
  }

  const statusAtual = estilosStatus[ocorrencia.status];
  const temCoordenadas = typeof ocorrencia.latitude === "number" && typeof ocorrencia.longitude === "number";
  const conteudoLocalizacao = (
    <>
      <View style={styles.iconeLocalizacaoCard}><IconeMapa width={20} height={20} fill={cores.surface} /></View>
      <View style={styles.textosLocalizacaoCard}>
        <Text style={styles.localizacaoTitulo}>{temCoordenadas ? `Localização em ${ocorrencia.bairro}` : ocorrencia.bairro}</Text>
        <Text style={styles.localizacaoSubtitulo}>{temCoordenadas ? "Toque para abrir no mapa" : "Coordenadas não informadas"}</Text>
      </View>
      {temCoordenadas ? <Text style={styles.setaMapa}>›</Text> : null}
    </>
  );

  return (
    <View style={styles.tela}>
      <Stack.Screen options={{ headerShown: false }} />
      {cabecalho}
      <ScrollView contentContainerStyle={styles.container}>
        {ocorrencia.imagemUrl ? (
          <Image source={{ uri: ocorrencia.imagemUrl }} style={styles.imagem} resizeMode="cover" accessibilityLabel={`Foto de ${ocorrencia.titulo}`} />
        ) : (
          <View style={styles.imagemVazia} accessible accessibilityLabel="Foto não disponível">
            <IconeFoto width={36} height={36} fill={cores.textSubtle} />
            <Text style={styles.imagemVaziaTexto}>Foto não disponível</Text>
          </View>
        )}

        <View style={styles.tituloLinha}>
          <Text style={styles.titulo}>{ocorrencia.titulo}</Text>
          <Text style={[styles.status, { color: statusAtual.texto, backgroundColor: statusAtual.fundo }]}>{statusAtual.rotulo}</Text>
        </View>

        <View style={styles.informacoes}>
          <LinhaInformacao Icone={IconeLocalizacao} titulo="Bairro" valor={ocorrencia.bairro} />
          <LinhaInformacao Icone={IconeCategoria} titulo="Categoria" valor={ocorrencia.categoria} />
          <LinhaInformacao Icone={IconeData} titulo="Data de registro" valor={ocorrencia.registradaEm} />
          <View style={styles.linhaInformacao}>
            <View style={styles.iconeInformacao}><IconeDescricao width={18} height={18} fill={cores.textMuted} /></View>
            <View style={styles.textosInformacao}><Text style={styles.label}>Descrição</Text><Text style={styles.descricao}>{ocorrencia.descricao}</Text></View>
          </View>
          {ocorrencia.nomeAutorPublico ? <View style={styles.autorBox}><Text style={styles.autorLabel}>Publicado por</Text><Text style={styles.autor}>{ocorrencia.nomeAutorPublico}</Text></View> : null}
        </View>

        {temCoordenadas ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Abrir localização de ${ocorrencia.bairro} no mapa`} onPress={() => void abrirMapa()} style={styles.localizacaoCard}>{conteudoLocalizacao}</Pressable>
        ) : (
          <View style={styles.localizacaoCard}>{conteudoLocalizacao}</View>
        )}

        <View style={styles.blocoAcompanhamento}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={apoiando ? "Remover apoio da ocorrência" : "Apoiar ocorrência"}
            accessibilityValue={typeof ocorrencia.totalApoios === "number"
              ? { text: `${ocorrencia.totalApoios} ${ocorrencia.totalApoios === 1 ? "apoio" : "apoios"}` }
              : undefined}
            accessibilityState={{ disabled: apoioEmCarregamento || autenticando || carregandoAuth }}
            disabled={apoioEmCarregamento || autenticando || carregandoAuth}
            onPress={() => void alternarAcompanhamento()}
            style={[styles.botaoAcompanhamento, apoiando && styles.botaoApoiado]}
          >
            {apoioEmCarregamento || autenticando ? <ActivityIndicator color={cores.surface} /> : <IconeApoiar width={20} height={20} fill={cores.surface} />}
            <Text style={styles.textoAcompanhamento}>{apoiando ? "Apoiado" : "Apoiar ocorrência"}</Text>
            {typeof ocorrencia.totalApoios === "number" ? (
              <View style={styles.badgeApoios}>
                <Text style={styles.badgeApoiosTexto}>{ocorrencia.totalApoios}</Text>
              </View>
            ) : null}
          </Pressable>
          {erroApoio ? <Text accessibilityRole="alert" style={styles.erroApoio}>{erroApoio}</Text> : null}
        </View>

        <Text style={styles.disclaimer}>O BairroAtivo não é um serviço oficial da prefeitura.</Text>
      </ScrollView>
      <NavegacaoInferior ativa="ocorrencias" />
      <Modal visible={menuAberto} transparent animationType="fade" onRequestClose={() => definirMenuAberto(false)}>
        <Pressable style={styles.fundoModal} onPress={() => definirMenuAberto(false)}>
          <View style={[styles.menu, { marginTop: Math.max(insets.top, 12) + 44 }]}>
            <Pressable accessibilityRole="button" onPress={() => void compartilhar()} style={styles.acaoMenu}><Text style={styles.acaoMenuTexto}>Compartilhar ocorrência</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => definirMenuAberto(false)} style={styles.acaoMenu}><Text style={styles.acaoMenuTexto}>Fechar</Text></Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
