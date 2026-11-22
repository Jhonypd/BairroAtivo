import { useEffect, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, Animated, Easing, Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Botao } from "@/shared/components/ui/Botao";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import IconeOcorrencias from "@/shared/icons/assignment_24dp_E3E3E3.svg";
import IconeAdicionar from "@/shared/icons/add_24dp_E3E3E3.svg";
import IconeNotificacoes from "@/shared/icons/notifications_24dp_E3E3E3.svg";
import { cores } from "@/configs/tema";
import { paginaInicialStyles as styles } from "./PaginaInicial.styles";
import { useAutenticacao } from "@/features/autenticacao/contexto/AutenticacaoProvider";
import { CartaoOcorrencia } from "@/features/ocorrencias/components/CartaoOcorrencia";
import { listarOcorrencias } from "@/features/ocorrencias/services/ocorrenciasSupabase";
import type { Ocorrencia } from "@/features/ocorrencias/types/Ocorrencia";
import { buscarCidadeDoUsuario, ehSchemaCidadeIndisponivel, obterCidadePublicaPadrao } from "@/shared/services/cidadesSupabase";

const ilustracaoBairro = require("../../../../assets/images/splash-background.jpg");

export default function PaginaInicial() {
  const { usuario, carregando, autenticando, erro, sair } = useAutenticacao();
  const [menuPerfilAberto, definirMenuPerfilAberto] = useState(false);
  const [dadosRecentes, definirDadosRecentes] = useState<{
    usuarioId: string | null;
    estado: "carregando" | "erro" | "pronto";
    ocorrencias: Ocorrencia[];
  }>({ usuarioId: null, estado: "carregando", ocorrencias: [] });
  const [progressoSeta] = useState(() => new Animated.Value(0));
  const rotacaoSeta = progressoSeta.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  useEffect(() => {
    let ativo = true;
    void (async () => {
      try {
        let recentes: Ocorrencia[];
        try {
          const cidadePerfil = usuario ? await buscarCidadeDoUsuario(usuario.id) : null;
          const cidade = cidadePerfil ?? await obterCidadePublicaPadrao();
          recentes = await listarOcorrencias({ cidadeIbge: cidade.codigoIbge });
        } catch (falha) {
          if (!ehSchemaCidadeIndisponivel(falha)) throw falha;
          recentes = await listarOcorrencias();
        }
        if (ativo) definirDadosRecentes({ usuarioId: usuario?.id ?? null, estado: "pronto", ocorrencias: recentes.slice(0, 3) });
      } catch {
        if (ativo) definirDadosRecentes({ usuarioId: usuario?.id ?? null, estado: "erro", ocorrencias: [] });
      }
    })();
    return () => { ativo = false; };
  }, [usuario, usuario?.id]);
  const recentesAtuais = dadosRecentes.usuarioId === (usuario?.id ?? null)
    ? dadosRecentes
    : { usuarioId: usuario?.id ?? null, estado: "carregando" as const, ocorrencias: [] };
  const nomePerfil = typeof usuario?.user_metadata.full_name === "string"
    ? usuario.user_metadata.full_name
    : typeof usuario?.user_metadata.name === "string"
      ? usuario.user_metadata.name
      : usuario?.email?.split("@")[0] ?? "visitante";
  const iniciaisPerfil = nomePerfil.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toLocaleUpperCase("pt-BR") || "BA";
  const fotoPerfil = typeof usuario?.user_metadata.avatar_url === "string"
    ? usuario.user_metadata.avatar_url
    : typeof usuario?.user_metadata.picture === "string"
      ? usuario.user_metadata.picture
      : null;

  function abrirMenuPerfil() {
    progressoSeta.stopAnimation();
    definirMenuPerfilAberto(true);
    Animated.timing(progressoSeta, {
      toValue: 1,
      duration: 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  function fecharMenuPerfil() {
    progressoSeta.stopAnimation();
    definirMenuPerfilAberto(false);
    Animated.timing(progressoSeta, {
      toValue: 0,
      duration: 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.rolagem}
        contentContainerStyle={styles.container}
      >
        <View style={styles.cabecalho}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir opções de perfil"
            accessibilityState={{ expanded: menuPerfilAberto }}
            onPress={abrirMenuPerfil}
            style={({ pressed }) => [styles.perfilResumo, pressed && styles.perfilResumoPressionado]}
          >
            <View style={styles.avatar}>
              {fotoPerfil ? (
                <Image source={{ uri: fotoPerfil }} style={styles.fotoPerfil} accessibilityLabel="Foto do perfil" />
              ) : (
                <Text style={styles.iniciais}>{iniciaisPerfil}</Text>
              )}
            </View>
            <View style={styles.saudacao}>
              <View style={styles.nomeComSeta}>
                <Text numberOfLines={1} style={styles.nome}>
                  {carregando ? "Verificando sessão…" : usuario ? nomePerfil : "Visitante"}
                </Text>
                <Animated.View
                  style={[
                    styles.setaPerfil,
                    { transform: [{ rotate: "45deg" }, { rotate: rotacaoSeta }] },
                  ]}
                />
              </View>
            </View>
          </Pressable>
          <View style={styles.notificacao} accessibilityLabel="Notificações">
            <IconeNotificacoes
              width={24}
              height={24}
              fill={cores.primaryDark}
            />
            <View style={styles.indicadorNotificacao} />
          </View>
        </View>
        {erro ? <Text accessibilityRole="alert" style={{ color: cores.error }}>{erro}</Text> : null}

        <View style={styles.hero}>
          <Image
            source={ilustracaoBairro}
            resizeMode="cover"
            style={styles.ilustracaoHero}
            accessibilityLabel="Ilustração de um bairro verde"
          />
          <Svg
            width="100%"
            height="100%"
            style={styles.gradienteHero}
            pointerEvents="none"
          >
            <Defs>
              <LinearGradient
                id="gradienteHero"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <Stop offset="0%" stopColor="#E4F1E5" />
                <Stop offset="42%" stopColor="#E4F1E5" />
                <Stop offset="60%" stopColor="#E4F1E5" stopOpacity="0.85" />
                <Stop offset="72%" stopColor="#E4F1E5" stopOpacity="0.48" />
                <Stop offset="100%" stopColor="#E4F1E5" stopOpacity="0.04" />
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#gradienteHero)"
            />
          </Svg>
          <View style={styles.heroConteudo}>
            <Text style={styles.titulo}>
              Uma cidade melhor começa com você.
            </Text>
            <Text style={styles.subtitulo}>
              Registre problemas, acompanhe soluções e ajude a construir um
              bairro mais ativo.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={styles.botaoComSeta}>
            <Botao
              label="Ver ocorrências"
              href="/ocorrencias"
              icon={
                <IconeOcorrencias width={24} height={24} fill={cores.surface} />
              }
              iconPosition="leading"
              variant="primary"
              fullWidth
              style={styles.botaoOcorrencias}
              contentStyle={styles.conteudoBotao}
              labelStyle={styles.rotuloBotaoOcorrencias}
            />
            <Text pointerEvents="none" style={styles.setaOcorrencias}>
              ›
            </Text>
          </View>
          <Botao
            label="Registrar ocorrência"
            href="/ocorrencias/nova"
            icon={
              <View style={styles.iconeAdicionar}>
                <IconeAdicionar width={22} height={22} fill={cores.surface} />
              </View>
            }
            variant="outline"
            fullWidth
            style={styles.botaoRegistrar}
            contentStyle={styles.conteudoBotao}
            labelStyle={styles.rotuloBotaoRegistrar}
          />
        </View>

        <View style={styles.recentesCabecalho}>
          <Text style={styles.recentesTitulo}>Ocorrências recentes</Text>
          <Pressable accessibilityRole="link" onPress={() => router.push("/ocorrencias")}>
            <Text style={styles.verTodas}>Ver todas</Text>
          </Pressable>
        </View>
        {recentesAtuais.estado === "carregando" ? <ActivityIndicator accessibilityLabel="Carregando ocorrências recentes" color={cores.primary} /> : recentesAtuais.estado === "erro" ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioTexto}>Não foi possível carregar as ocorrências recentes. Tente novamente mais tarde.</Text>
          </View>
        ) : recentesAtuais.ocorrencias.length > 0 ? (
          <View style={{ gap: 12 }}>
            {recentesAtuais.ocorrencias.map((ocorrencia) => <CartaoOcorrencia key={ocorrencia.id} ocorrencia={ocorrencia} />)}
          </View>
        ) : (
          <View style={styles.vazio}><Text style={styles.vazioTexto}>Ainda não há ocorrências recentes nesta cidade.</Text></View>
        )}
      </ScrollView>
      <Modal
        visible={menuPerfilAberto}
        transparent
        animationType="fade"
        onRequestClose={fecharMenuPerfil}
      >
        <View style={styles.menuPerfilOverlay}>
          <Pressable
            accessibilityLabel="Fechar opções de perfil"
            onPress={fecharMenuPerfil}
            style={styles.menuPerfilFundo}
          />
          <View style={styles.menuPerfil}>
            <Text style={styles.menuPerfilNome} numberOfLines={1}>
              {carregando ? "Verificando sessão…" : usuario ? nomePerfil : "Visitante"}
            </Text>
            {usuario?.email ? (
              <Text style={styles.menuPerfilEmail} numberOfLines={1}>{usuario.email}</Text>
            ) : null}
            <View style={styles.menuPerfilDivisor} />
            {usuario ? (
              <Botao
                label={autenticando ? "Saindo…" : "Sair da conta"}
                onPress={() => {
                  void sair().then(fecharMenuPerfil).catch(() => undefined);
                }}
                disabled={autenticando}
                variant="ghost"
                size="sm"
                style={styles.acaoMenuPerfil}
              />
            ) : (
              <Botao
                label={carregando ? "Aguarde…" : "Entrar"}
                onPress={() => {
                  fecharMenuPerfil();
                  router.push("/login");
                }}
                disabled={carregando}
                variant="ghost"
                size="sm"
                style={styles.acaoMenuPerfil}
              />
            )}
          </View>
        </View>
      </Modal>
      <NavegacaoInferior ativa="inicio" />
    </SafeAreaView>
  );
}
