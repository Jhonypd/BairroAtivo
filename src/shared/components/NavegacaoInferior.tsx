import { router } from "expo-router";
import type { ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";
import { cores } from "@/configs/tema";
import IconeInicio from "@/shared/icons/home_24dp_E3E3E3.svg";
import IconeOcorrencias from "@/shared/icons/assignment_24dp_E3E3E3.svg";
import IconeAdicionar from "@/shared/icons/add_24dp_E3E3E3.svg";
import IconePerfil from "@/shared/icons/manage_accounts_24dp_E3E3E3.svg";

type Aba = "inicio" | "ocorrencias" | "registrar" | "perfil";

const itens: {
  chave: Aba;
  rotulo: string;
  Icone: ComponentType<SvgProps>;
  rota: string;
}[] = [
  {
    chave: "inicio",
    rotulo: "Início",
    Icone: IconeInicio,
    rota: "/inicio",
  },
  {
    chave: "ocorrencias",
    rotulo: "Ocorrências",
    Icone: IconeOcorrencias,
    rota: "/ocorrencias",
  },
  {
    chave: "registrar",
    rotulo: "Registrar",
    Icone: IconeAdicionar,
    rota: "/ocorrencias/nova",
  },
  {
    chave: "perfil",
    rotulo: "Perfil",
    Icone: IconePerfil,
    rota: "/login",
  },
];

export function NavegacaoInferior({ ativa }: { ativa: Aba }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.barra, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {itens.map((item) => (
        <Pressable
          key={item.chave}
          accessibilityRole="button"
          accessibilityLabel={item.rotulo}
          accessibilityState={{ selected: item.chave === ativa }}
          onPress={() => {
            if (item.chave === ativa) return;
            router.push(item.rota as never);
          }}
          style={styles.item}
        >
          <item.Icone
            width={24}
            height={24}
            fill={ativa === item.chave ? cores.primary : cores.textMuted}
          />
          <Text style={[styles.rotulo, ativa === item.chave && styles.ativo]}>
            {item.rotulo}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: cores.border,
    backgroundColor: cores.surface,
  },
  item: { minWidth: 64, alignItems: "center", gap: 2 },
  rotulo: { fontSize: 10, color: cores.textMuted },
  ativo: { color: cores.primary, fontWeight: "700" },
});
