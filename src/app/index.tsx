import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";
import { homeStyles as styles } from "../styles/screens/home.styles";

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>CONSULTA COMUNITÁRIA</Text>
        <Text style={styles.title}>Problemas no seu bairro?</Text>
        <Text style={styles.subtitle}>Consulte os relatos da comunidade ou registre um problema para conhecer o funcionamento do aplicativo.</Text>
        <View style={styles.actions}>
          <ActionButton label="Consultar ocorrências" href="/occurrences/index" />
          <ActionButton label="Testar formulário de cadastro" href="/create" secondary />
        </View>
      </View>
      <View style={styles.notice}>
        <View style={styles.noticeCopy}>
          <Text style={styles.noticeTitle}>Sobre este projeto</Text>
          <Text style={styles.noticeText}>Este é um projeto acadêmico. Os relatos são fictícios e não são enviados à prefeitura.</Text>
        </View>
      </View>
    </ScrollView>
  );
}
