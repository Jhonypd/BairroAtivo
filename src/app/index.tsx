import { Image, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton } from "../components/ActionButton";
import { homeStyles as styles } from "../styles/screens/home.styles";

const logo = require("../../assets/images/logo_.png");
const neighborhoodIllustration = require("../../assets/images/card_principal.png");

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="BairroAtivo" />
        <View style={styles.hero}>
          <Text style={styles.title}>Juntos por um bairro melhor.</Text>
          <Text style={styles.subtitle}>Registre problemas, acompanhe as soluções e ajude a construir bairros mais seguros, limpos e agradáveis para todos.</Text>
        </View>
        <Image source={neighborhoodIllustration} style={styles.illustration} resizeMode="contain" accessibilityLabel="Ilustração de um bairro com casas, árvores e ruas" />
        <View style={styles.actions}>
          <ActionButton label="Ver ocorrências" href="/occurrences" size="lg" fullWidth />
          <ActionButton label="Registrar ocorrência" href="/access" variant="outline" fullWidth />
        </View>
        <Text style={styles.notice}>Projeto comunitário demonstrativo. Os relatos não são enviados à prefeitura.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
