import { Image, ScrollView, Text, View } from "react-native";
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

const ilustracaoBairro = require("../../../../assets/images/splash-background.jpg");

export default function PaginaInicial() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.rolagem}
        contentContainerStyle={styles.container}
      >
        <View style={styles.cabecalho}>
          <View style={styles.perfilResumo}>
            <View style={styles.avatar}>
              <Text style={styles.iniciais}>BA</Text>
            </View>
            <View style={styles.saudacao}>
              <Text style={styles.ola}>Olá,</Text>
              <Text style={styles.nome}>visitante</Text>
            </View>
          </View>
          <View style={styles.notificacao} accessibilityLabel="Notificações">
            <IconeNotificacoes
              width={24}
              height={24}
              fill={cores.primaryDark}
            />
            <View style={styles.indicadorNotificacao} />
          </View>
        </View>

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
            href="/login"
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
          <Text style={styles.verTodas}>Ver todas</Text>
        </View>
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>
            Faça login para ver seu histórico de ocorrências.
          </Text>
          <Botao label="Entrar" href="/login" variant="ghost" size="sm" />
        </View>
      </ScrollView>
      <NavegacaoInferior ativa="inicio" />
    </SafeAreaView>
  );
}
