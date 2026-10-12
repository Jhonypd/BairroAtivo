import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Botao } from "@/shared/components/ui/Botao";
import { ocorrencias } from "../data/ocorrenciasSimuladas";
import { paginaDetalheOcorrenciaStyles as styles } from "./PaginaDetalheOcorrencia.styles";
import { cores } from "@/configs/tema";

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return ocorrencias.map(({ id }) => ({ id }));
}

export default function PaginaDetalheOcorrencia() {
  const { id: idRota } = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(idRota) ? idRota[0] : idRota;
  const ocorrencia = ocorrencias.find((item) => item.id === id);

  if (!ocorrencia) {
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
          <Text style={styles.titulo}>Nenhuma ocorrência encontrada</Text>
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
          Este é um registro demonstrativo. O BairroAtivo não é um serviço oficial da prefeitura.
        </Text>
      </ScrollView>
    </>
  );
}








