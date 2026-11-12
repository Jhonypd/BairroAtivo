import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { cores } from "@/configs/tema";
import IconeOpcoes from "@/shared/icons/ellipsis-vertical.svg";
import type { Ocorrencia } from "../types/Ocorrencia";
import { cartaoOcorrenciaStyles as styles } from "./CartaoOcorrencia.styles";
import IconeLocalizacao from "@/shared/icons/location_on_24dp_E3E3E3.svg";

const coresStatus: Record<Ocorrencia["status"], { text: string; background: string }> = {
  Aberta: { text: cores.statusOpen, background: "#FCE8E6" },
  "Em acompanhamento": { text: cores.statusInProgress, background: "#FFF2CC" },
  Resolvida: { text: cores.statusResolved, background: "#E1F3E7" },
};

type Propriedades = {
  ocorrencia: Ocorrencia;
  mostrarOpcoes?: boolean;
  aoAbrirOpcoes?: () => void;
};

export function CartaoOcorrencia({ ocorrencia, mostrarOpcoes = false, aoAbrirOpcoes }: Propriedades) {
  const [focado, setFocado] = useState(false);
  const [sobrevoado, setSobrevoado] = useState(false);
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhes de ${ocorrencia.titulo}`}
        accessibilityHint="Abre os detalhes da ocorrência"
        onPress={() => router.push({ pathname: "/ocorrencias/[id]", params: { id: ocorrencia.id } })}
        focusable
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        onHoverIn={() => setSobrevoado(true)}
        onHoverOut={() => setSobrevoado(false)}
        style={({ pressed, hovered }) => [
          styles.conteudoClicavel,
          hovered && styles.hovered,
          focado && styles.focused,
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.topLine, mostrarOpcoes && styles.topLineComOpcoes]}>
          <Text numberOfLines={1} style={styles.categoria}>{ocorrencia.categoria}</Text>
          <Text numberOfLines={1} style={[styles.status, mostrarOpcoes && styles.statusComOpcoes, { color: coresStatus[ocorrencia.status].text, backgroundColor: coresStatus[ocorrencia.status].background }]}>
            {ocorrencia.status}
          </Text>
        </View>
        <View style={styles.body}>
          <View style={styles.conteudo}>
            <Text numberOfLines={1} style={styles.titulo}>{ocorrencia.titulo}</Text>
            <View style={styles.localizacao}>
              <IconeLocalizacao width={15} height={15} fill={cores.primary} accessibilityLabel="Localização" />
              <Text numberOfLines={1} style={styles.bairro}>{ocorrencia.bairro}</Text>
            </View>
            <Text numberOfLines={1} style={styles.autor}>
              {ocorrencia.nomeAutorPublico ? `Por ${ocorrencia.nomeAutorPublico}` : "Autor não informado"}
            </Text>
          </View>
          {ocorrencia.imagemUrl ? (
            <Image
              testID="imagem-ocorrencia"
              source={{ uri: ocorrencia.imagemUrl }}
              style={styles.imagem}
              resizeMode="cover"
              accessibilityLabel="Foto da ocorrência"
            />
          ) : (
            <View style={styles.imagemVazia} accessible={false} />
          )}
        </View>
        <View style={styles.divisor} />
        <View style={styles.rodape}>
          <Text numberOfLines={1} style={styles.data} accessibilityLabel={`Data: ${ocorrencia.registradaEm}`}>{ocorrencia.registradaEm}</Text>
          <View style={styles.acao}>
            <Text style={styles.more}>Ver detalhes</Text>
            <Text style={[styles.seta, sobrevoado && styles.setaSobrevoada]} accessibilityElementsHidden>›</Text>
          </View>
        </View>
      </Pressable>
      {mostrarOpcoes && aoAbrirOpcoes ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir opções de ${ocorrencia.titulo}`}
          onPress={aoAbrirOpcoes}
          hitSlop={6}
          style={({ pressed }) => [styles.botaoOpcoes, pressed && styles.pressed]}
        >
          <IconeOpcoes width={15} height={15} />
          <Text style={styles.textoOpcoes}>Opções</Text>
        </Pressable>
      ) : null}
    </View>
  );
}







