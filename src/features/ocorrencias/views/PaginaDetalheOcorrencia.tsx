import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Botao } from "@/shared/components/ui/Botao";
import { buscarOcorrenciaPorId } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";
import { paginaDetalheOcorrenciaStyles as styles } from "./PaginaDetalheOcorrencia.styles";
import { cores } from "@/configs/tema";

export default function PaginaDetalheOcorrencia() {
  const { id: idRota } = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(idRota) ? idRota[0] : idRota;
  const [ocorrencia, definirOcorrencia] = useState<Ocorrencia | null>(null);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState(false);

  useEffect(() => {
    let ativa = true;
    if (!id) return;
    buscarOcorrenciaPorId(id)
      .then((resultado) => { if (ativa) definirOcorrencia(resultado); })
      .catch(() => { if (ativa) definirErro(true); })
      .finally(() => { if (ativa) definirCarregando(false); });
    return () => { ativa = false; };
  }, [id]);

  if (carregando && id && !erro) {
    return <View style={styles.notFound}><ActivityIndicator accessibilityLabel="Carregando ocorrência" /><Text style={styles.value}>Carregando ocorrência...</Text></View>;
  }

  if (!id || erro || !ocorrencia) {
    return (
      <>
        <Stack.Screen options={{ title: "Ocorrência" }} />
        <View style={styles.notFound}>
          <Botao
            label="Voltar às ocorrências"
            href="/ocorrencias"
            replace
            variant="outline"
            size="sm"
          />
          <Text style={styles.titulo}>
            {!id
              ? "Identificador da ocorrência inválido"
              : erro
                ? "Não foi possível carregar a ocorrência"
                : "Nenhuma ocorrência encontrada"}
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Detalhes da ocorrência" }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Botao
          label="Voltar às ocorrências"
          href="/ocorrencias"
          replace
          variant="outline"
          size="sm"
        />
        <Text style={styles.titulo}>{ocorrencia.titulo}</Text>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Categoria</Text>
          <Text style={styles.value}>{ocorrencia.categoria}</Text>
          <Text style={styles.label}>Bairro</Text>
          <Text style={styles.value}>{ocorrencia.bairro}</Text>
          <Text style={styles.label}>Data do registro</Text>
          <Text style={styles.value}>{ocorrencia.registradaEm}</Text>
          {ocorrencia.nomeAutorPublico ? <><Text style={styles.label}>Publicado por</Text><Text style={styles.value}>{ocorrencia.nomeAutorPublico}</Text></> : null}
          <Text style={styles.label}>Status comunitário</Text>
          <Text style={[styles.status, { color: ocorrencia.status === "Aberta" ? cores.statusOpen : ocorrencia.status === "Resolvida" ? cores.statusResolved : cores.statusInProgress }]}>
            {ocorrencia.status}
          </Text>
        </View>
        <View style={styles.descriptionCard}>
          <Text style={styles.label}>Descrição</Text>
          <Text style={styles.descricao}>{ocorrencia.descricao}</Text>
        </View>
        <Text style={styles.disclaimer}>
          O BairroAtivo não é um serviço oficial da prefeitura.
        </Text>
      </ScrollView>
    </>
  );
}








