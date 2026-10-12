import { Image, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Botao } from "@/shared/components/ui/Botao";
import { paginaInicialStyles as styles } from "./PaginaInicial.styles";

const logoBairroAtivo = require("../../../../assets/images/logo_.png");
const ilustracaoBairro = require("../../../../assets/images/card_principal.png");

export default function PaginaInicial() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={logoBairroAtivo} style={styles.logo} resizeMode="contain" accessibilityLabel="BairroAtivo" />
        <View style={styles.hero}>
          <Text style={styles.titulo}>Juntos por um bairro melhor.</Text>
          <Text style={styles.subtitulo}>Registre problemas, acompanhe as soluções e ajude a construir bairros mais seguros, limpos e agradáveis para todos.</Text>
        </View>
        <Image source={ilustracaoBairro} style={styles.illustration} resizeMode="contain" accessibilityLabel="Ilustração de um bairro com casas, árvores e ruas" />
        <View style={styles.actions}>
          <Botao label="Ver ocorrências" href="/ocorrencias" size="lg" fullWidth />
          <Botao label="Registrar ocorrência" href="/login" variant="outline" fullWidth />
        </View>
        <Text style={styles.notice}>Projeto comunitário demonstrativo. Os relatos não são enviados à prefeitura.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}








