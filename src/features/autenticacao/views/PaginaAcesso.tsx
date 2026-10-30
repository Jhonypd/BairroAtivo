import {
  Image,
  ImageBackground,
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Botao } from "@/shared/components/ui/Botao";
import { paginaAcessoStyles as styles } from "./PaginaAcesso.styles";
import { useAutenticacao } from "../contexto/AutenticacaoProvider";
import { useEffect } from "react";
import { cores } from "@/configs/tema";
import GoogleIcon from "@/shared/icons/devicon--google.svg";

const logo = require("../../../../assets/images/logo_.png");
const paisagem = require("../../../../assets/images/splash-background.jpg");

export default function PaginaAcesso() {
  const { usuario, carregando, autenticando, erro, entrarComGoogle } = useAutenticacao();
  const { height } = useWindowDimensions();
  const alturaDestaque = Math.min(Math.max(height * 0.56, 320), 430);

  useEffect(() => {
    if (!carregando && usuario) router.replace("/inicio");
  }, [carregando, usuario]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <ImageBackground
          source={paisagem}
          resizeMode="cover"
          style={[styles.destaque, { height: alturaDestaque }]}
          accessibilityLabel="Ilustração de um bairro com casas, árvores e uma estrada"
        >
          <View style={styles.cartaoMarca}>
            <Image
              source={logo}
              resizeMode="contain"
              style={styles.logo}
              accessibilityLabel="BairroAtivo"
            />
            <Text style={styles.slogan}>
              Sua cidade mais ativa e melhor para todos.
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.conteudo}>
          <View style={styles.intro}>
            <Text style={styles.titulo}>Bem-vindo ao seu bairro</Text>
            <Text style={styles.descricao}>
              Acesse sua conta para registrar e acompanhar ocorrências na sua
              comunidade.
            </Text>
          </View>

          <Botao
            label={autenticando ? "Conectando..." : "Continuar com Google"}
            icon={autenticando ? <ActivityIndicator color={cores.primaryDark} /> : <GoogleIcon width={20} height={20} accessibilityLabel="Google" />}
            onPress={() => void entrarComGoogle()}
            disabled={autenticando || carregando}
            variant="outline"
            fullWidth
            style={styles.botaoGoogle}
          />
          {erro ? <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text> : null}

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          <Botao
            label="Explorar sem login"
            href="/inicio"
            variant="secondary"
            fullWidth
            style={styles.botaoExplorar}
          />
          <Text style={styles.helper}>
            Você poderá consultar ocorrências de forma pública. Para registrar,
            editar e acompanhar é necessário fazer login.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
