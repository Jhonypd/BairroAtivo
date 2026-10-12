import { useMemo, useState } from "react";
import { FlatList, ScrollView, Text, TextInput, View } from "react-native";
import { Botao } from "@/shared/components/ui/Botao";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import { FiltroStatus } from "../components/FiltroStatus";
import { CartaoOcorrencia } from "../components/CartaoOcorrencia";
import { ocorrencias } from "../data/ocorrenciasSimuladas";
import { ocorrenciasStyles as styles } from "./PaginaOcorrencias.styles";

const filtrosStatus = [
  "Todas",
  "Aberta",
  "Em acompanhamento",
  "Resolvida",
] as const;
type FiltroStatusTipo = (typeof filtrosStatus)[number];
const rotulosFiltroStatus: Record<FiltroStatusTipo, string> = {
  Todas: "Todas",
  Aberta: "Abertas",
  "Em acompanhamento": "Em andamento",
  Resolvida: "Resolvidas",
};

export default function PaginaOcorrencias() {
  const [consulta, definirConsulta] = useState("");
  const [filtroStatus, definirFiltroStatus] =
    useState<FiltroStatusTipo>("Todas");
  const ocorrenciasVisiveis = useMemo(() => {
    const consultaNormalizada = consulta.trim().toLocaleLowerCase("pt-BR");
    return ocorrencias.filter((ocorrencia) => {
      const correspondeStatus =
        filtroStatus === "Todas" || ocorrencia.status === filtroStatus;
      const textoPesquisavel =
        `${ocorrencia.titulo} ${ocorrencia.bairro} ${ocorrencia.categoria}`.toLocaleLowerCase(
          "pt-BR",
        );
      return (
        correspondeStatus && textoPesquisavel.includes(consultaNormalizada)
      );
    });
  }, [consulta, filtroStatus]);

  return (
    <View style={styles.tela}>
      <View style={styles.cabecalhoConteudo}>
        <View style={styles.intro}>
          <Text style={styles.titulo}>Relatos da comunidade</Text>
          <Text style={styles.descricao}>
            Veja o que está acontecendo nos bairros.
          </Text>
        </View>

        <TextInput
          value={consulta}
          onChangeText={definirConsulta}
          placeholder="Buscar por palavra-chave..."
          placeholderTextColor={styles.placeholder.color}
          style={styles.search}
          accessibilityLabel="Buscar ocorrências"
          returnKeyType="search"
        />

        <ScrollView
          horizontal
          style={styles.filtrosRolagem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filtrosStatus.map((filter) => (
            <FiltroStatus
              key={filter}
              label={rotulosFiltroStatus[filter]}
              selected={filtroStatus === filter}
              onPress={() => definirFiltroStatus(filter)}
            />
          ))}
        </ScrollView>

        <Text style={styles.resultCount}>
          {ocorrenciasVisiveis.length}{" "}
          {ocorrenciasVisiveis.length === 1 ? "ocorrência" : "ocorrências"}
        </Text>
      </View>

      <FlatList
        style={styles.listaOcorrencias}
        contentContainerStyle={styles.list}
        data={ocorrenciasVisiveis}
        keyExtractor={(ocorrencia) => ocorrencia.id}
        renderItem={({ item }) => <CartaoOcorrencia ocorrencia={item} />}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhuma ocorrência encontrada</Text>
            <Text style={styles.emptyDescription}>
              Tente outra palavra ou limpe os filtros para ver todos os relatos.
            </Text>
            <Botao
              label="Limpar busca e filtros"
              onPress={() => {
                definirConsulta("");
                definirFiltroStatus("Todas");
              }}
              variant="outline"
              size="sm"
            />
          </View>
        }
      />

      <View style={styles.rodapeConteudo}>
        <Botao label="Registrar ocorrência" href="/login" size="lg" fullWidth />
        <Text style={styles.disclaimer}>
          Os registros são fictícios. O BairroAtivo não é um serviço oficial da
          prefeitura.
        </Text>
      </View>
      <NavegacaoInferior ativa="ocorrencias" />
    </View>
  );
}
