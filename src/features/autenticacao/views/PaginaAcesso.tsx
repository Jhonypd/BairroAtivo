import { Image, ScrollView, Text, View } from "react-native";
import { Botao } from "@/shared/components/ui/Botao";
import { paginaAcessoStyles as styles } from "./PaginaAcesso.styles";

const logo = require("../../../../assets/images/logo_.png");

export default function PaginaAcesso() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="BairroAtivo" />
      <View style={styles.intro}>
        <Text style={styles.titulo}>Entre para registrar ocorrências</Text>
        <Text style={styles.descricao}>
          O acesso será necessário para cadastrar e gerenciar relatos. A consulta continua aberta para todos.
        </Text>
      </View>

      <View style={styles.loginAction}>
        <Botao
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

      <Botao label="Explorar sem login" href="/ocorrencias" variant="secondary" fullWidth />
      <Botao label="Pré-visualizar o formulário" href="/ocorrencias/nova" variant="ghost" fullWidth />
      <Botao label="Voltar ao início" href="/" variant="outline" fullWidth />
    </ScrollView>
  );
}







