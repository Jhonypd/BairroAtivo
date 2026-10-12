import { Image, ScrollView, Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";
import { accessStyles as styles } from "../styles/screens/access.styles";

const logo = require("../../assets/images/logo_.png");

export default function AccessScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="BairroAtivo" />
      <View style={styles.intro}>
        <Text style={styles.title}>Entre para registrar ocorrências</Text>
        <Text style={styles.description}>
          O acesso será necessário para cadastrar e gerenciar relatos. A consulta continua aberta para todos.
        </Text>
      </View>

      <View style={styles.loginAction}>
        <ActionButton
          label="Continuar com Google"
          icon={<Text style={styles.googleMark}>G</Text>}
          disabled
          fullWidth
        />
        <Text style={styles.helper}>A entrada com Google será habilitada quando a autenticação for implementada.</Text>
      </View>

      <View style={styles.separator}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>ou</Text>
        <View style={styles.separatorLine} />
      </View>

      <ActionButton label="Explorar sem login" href="/occurrences" variant="secondary" fullWidth />
      <ActionButton label="Pré-visualizar o formulário" href="/create" variant="ghost" fullWidth />
      <ActionButton label="Voltar ao início" href="/" variant="outline" fullWidth />
    </ScrollView>
  );
}
