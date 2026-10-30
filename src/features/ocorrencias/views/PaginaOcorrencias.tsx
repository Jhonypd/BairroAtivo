import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { Botao } from "@/shared/components/ui/Botao";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import { FiltroStatus } from "../components/FiltroStatus";
import { CampoSelecao } from "../components/CampoSelecao";
import { CartaoOcorrencia } from "../components/CartaoOcorrencia";
import { listarOcorrencias } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";
import { ocorrenciasStyles as styles } from "./PaginaOcorrencias.styles";
import { useCarregamentoGlobal } from "@/shared/components/ui/CarregamentoGlobal";

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
  const [ocorrencias, definirOcorrencias] = useState<Ocorrencia[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [atualizando, definirAtualizando] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);
  const [consulta, definirConsulta] = useState("");
  const [filtroStatus, definirFiltroStatus] =
    useState<FiltroStatusTipo>("Todas");
  const [filtroBairro, definirFiltroBairro] = useState("");
  const [filtroCategoria, definirFiltroCategoria] = useState("");
  const [campoAberto, definirCampoAberto] = useState<"bairro" | "categoria" | null>(null);
  const requisicaoAtual = useRef(0);
  const { executarComCarregamento } = useCarregamentoGlobal();

  const bairrosDisponiveis = useMemo(
    () => [...new Set(ocorrencias.map(({ bairro }) => bairro.trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR")),
    [ocorrencias],
  );
  const categoriasDisponiveis = useMemo(
    () => [...new Set(ocorrencias.map(({ categoria }) => categoria.trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR")),
    [ocorrencias],
  );

  const ocorrenciasVisiveis = useMemo(() => {
    const consultaNormalizada = consulta.trim().toLocaleLowerCase("pt-BR");
    return ocorrencias.filter((ocorrencia) => {
      const correspondeStatus =
        filtroStatus === "Todas" || ocorrencia.status === filtroStatus;
      const correspondeBairro = !filtroBairro || ocorrencia.bairro === filtroBairro;
      const correspondeCategoria = !filtroCategoria || ocorrencia.categoria === filtroCategoria;
      const textoPesquisavel =
        `${ocorrencia.titulo} ${ocorrencia.bairro} ${ocorrencia.categoria}`.toLocaleLowerCase(
          "pt-BR",
        );
      return (
        correspondeStatus && correspondeBairro && correspondeCategoria &&
        textoPesquisavel.includes(consultaNormalizada)
      );
    });
  }, [consulta, filtroBairro, filtroCategoria, filtroStatus, ocorrencias]);

  const filtrosAtivos = [
    consulta.trim() ? `Busca: ${consulta.trim()}` : "",
    filtroBairro,
    filtroCategoria,
    filtroStatus === "Todas" ? "" : rotulosFiltroStatus[filtroStatus],
  ].filter(Boolean);
  const temFiltrosAtivos = filtrosAtivos.length > 0;

  const limparFiltros = useCallback(() => {
    definirConsulta("");
    definirFiltroStatus("Todas");
    definirFiltroBairro("");
    definirFiltroCategoria("");
    definirCampoAberto(null);
  }, []);

  const carregarOcorrencias = useCallback(async (atualizacao = false) => {
    const idRequisicao = ++requisicaoAtual.current;
    if (atualizacao) definirAtualizando(true);
    else definirCarregando(true);
    definirErro(null);
    try {
      const resultado = await executarComCarregamento(listarOcorrencias, "Carregando ocorrências");
      if (idRequisicao === requisicaoAtual.current) definirOcorrencias(resultado);
    } catch {
      if (idRequisicao === requisicaoAtual.current) {
        definirErro("Não foi possível conectar ao servidor. Tente novamente.");
      }
    } finally {
      if (idRequisicao === requisicaoAtual.current) {
        definirCarregando(false);
        definirAtualizando(false);
      }
    }
  }, [executarComCarregamento]);

  useEffect(() => {
    const idRequisicao = ++requisicaoAtual.current;
    executarComCarregamento(listarOcorrencias, "Carregando ocorrências")
      .then((resultado) => {
        if (idRequisicao === requisicaoAtual.current) definirOcorrencias(resultado);
      })
      .catch(() => {
        if (idRequisicao === requisicaoAtual.current) {
          definirErro("Não foi possível conectar ao servidor. Tente novamente.");
        }
      })
      .finally(() => {
        if (idRequisicao === requisicaoAtual.current) definirCarregando(false);
      });
    return () => { requisicaoAtual.current += 1; };
  }, [executarComCarregamento]);

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

        <View style={styles.filtrosCampos}>
          <View style={[styles.filtroCampo, campoAberto === "bairro" && styles.filtroCampoAberto]}>
            <CampoSelecao
              label="Bairro"
              placeholder="Todos os bairros"
              options={bairrosDisponiveis}
              value={filtroBairro}
              onChange={definirFiltroBairro}
              aberto={campoAberto === "bairro"}
              aoAlternar={() => definirCampoAberto((atual) => atual === "bairro" ? null : "bairro")}
            />
          </View>
          <View style={[styles.filtroCampo, campoAberto === "categoria" && styles.filtroCampoAberto]}>
            <CampoSelecao
              label="Categoria"
              placeholder="Todas as categorias"
              options={categoriasDisponiveis}
              value={filtroCategoria}
              onChange={definirFiltroCategoria}
              aberto={campoAberto === "categoria"}
              aoAlternar={() => definirCampoAberto((atual) => atual === "categoria" ? null : "categoria")}
            />
          </View>
        </View>

        {temFiltrosAtivos ? (
          <View style={styles.filtrosAtivos}>
            <Text style={styles.filtrosSelecionados} numberOfLines={2}>
              Filtros: {filtrosAtivos.join(" · ")}
            </Text>
            <Botao label="Limpar filtros" onPress={limparFiltros} variant="ghost" size="xs" />
          </View>
        ) : null}

        <Text style={styles.resultCount}>
          {ocorrenciasVisiveis.length}{" "}
          {ocorrenciasVisiveis.length === 1 ? "ocorrência" : "ocorrências"}
        </Text>
        {erro && ocorrencias.length > 0 ? (
          <View style={styles.erroAtualizacao}>
            <Text style={styles.erroAtualizacaoTexto}>
              Não foi possível atualizar. Os resultados exibidos podem estar desatualizados.
            </Text>
            <Botao label="Tentar novamente" onPress={() => void carregarOcorrencias()} variant="outline" size="xs" />
          </View>
        ) : null}
      </View>

      <FlatList
        style={styles.listaOcorrencias}
        contentContainerStyle={styles.list}
        data={ocorrenciasVisiveis}
        keyExtractor={(ocorrencia) => ocorrencia.id}
        renderItem={({ item }) => <CartaoOcorrencia ocorrencia={item} />}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => void carregarOcorrencias(true)} />}
        ListEmptyComponent={carregando ? undefined : erro ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Não foi possível carregar</Text>
            <Text style={styles.emptyDescription}>{erro}</Text>
            <Botao label="Tentar novamente" onPress={() => void carregarOcorrencias()} variant="outline" size="sm" />
          </View>
        ) : ocorrencias.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhuma ocorrência cadastrada</Text>
            <Text style={styles.emptyDescription}>Quando a comunidade publicar ocorrências, elas aparecerão aqui.</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhuma ocorrência encontrada</Text>
            <Text style={styles.emptyDescription}>
              Tente outra palavra ou limpe os filtros para ver todos os relatos.
            </Text>
          </View>
        )}
      />

      <View style={styles.rodapeConteudo}>
        <Botao label="Registrar ocorrência" href="/login" size="lg" fullWidth />
        <Text style={styles.disclaimer}>
          O BairroAtivo não é um serviço oficial da prefeitura.
        </Text>
      </View>
      <NavegacaoInferior ativa="ocorrencias" />
    </View>
  );
}
