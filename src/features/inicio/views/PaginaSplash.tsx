import { useEffect } from "react";
import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

const logo = require("../../../../assets/images/logo_.png");
const ilustracao = require("../../../../assets/images/splash-background.jpg");

export default function PaginaSplash() {
  useEffect(() => {
    const temporizador = setTimeout(() => router.replace("/login"), 2200);
    return () => clearTimeout(temporizador);
  }, []);

  return (
    <View style={styles.tela}>
      <StatusBar style="dark" />
      <ImageBackground
        source={ilustracao}
        resizeMode="cover"
        style={styles.paisagem}
      />
      <Image
        source={logo}
        resizeMode="contain"
        style={styles.logo}
        accessibilityLabel="BairroAtivo"
      />
      <Text style={styles.slogan}>
        Sua cidade mais ativa{"\n"}e melhor para todos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#F2F8EE",
    justifyContent: "center",
    alignContent: "center",
  },
  paisagem: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    opacity: 0.88,
  },
  logo: {
    position: "absolute",
    top: "25%",
    alignSelf: "center",
    width: "88%",
    height: 140,
  },
  slogan: {
    position: "absolute",
    top: "47%",
    left: 24,
    right: 24,
    color: "#26342C",
    textAlign: "center",
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "500",
    flexWrap: "wrap",
  },
});
