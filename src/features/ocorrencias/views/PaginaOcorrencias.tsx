import { useCallback, useMemo, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { FlatList, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { Botao } from "@/shared/components/ui/Botao";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import { FiltroStatus } from "../components/FiltroStatus";
import { CampoSelecao } from "../components/CampoSelecao";
import { CartaoOcorrencia } from "../components/CartaoOcorrencia";
import { listarMinhasOcorrencias, listarOcorrencias } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";
import { ocorrenciasStyles as styles } from "./PaginaOcorrencias.styles";
import { useCarregamentoGlobal } from "@/shared/components/ui/CarregamentoGlobal";
import { useAutenticacao } from "@/features/autenticacao/contexto/AutenticacaoProvider";
import { AcoesOcorrenciaPropria } from "../components/AcoesOcorrenciaPropria";
import IconeFiltros from "@/shared/icons/filter_alt_24dp_E3E3E3.svg";
import IconeBusca from "@/shared/icons/search_24dp_E3E3E3.svg";
import { cores } from "@/configs/tema";

type VisualizacaoOcorrencias = "todas" | "minhas";

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

export default function PaginaOcorrencias({ visualizacaoInicial = "todas" }: { visualizacaoInicial?: VisualizacaoOcorrencias } = {}) {
  const [ocorrencias, definirOcorrencias] = useState<Ocorrencia[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [atualizando, definirAtualizando] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);
  const [consulta, definirConsulta] = useState("");
  const [filtroStatus, definirFiltroStatus] =
    useState<FiltroStatusTipo>("Todas");
  const [filtroBairro, definirFiltroBairro] = useState("");
  const [filtroCategoria, definirFiltroCategoria] = useState("");
  const [statusRascunho, definirStatusRascunho] = useState<FiltroStatusTipo>("Todas");
  const [bairroRascunho, definirBairroRascunho] = useState("");
  const [categoriaRascunho, definirCategoriaRascunho] = useState("");
  const [painelFiltrosAberto, definirPainelFiltrosAberto] = useState(false);
  const [campoAberto, definirCampoAberto] = useState<"bairro" | "categoria" | null>(null);
  const requisicaoAtual = useRef(0);
  const { executarComCarregamento } = useCarregamentoGlobal();
  const { usuario, carregando: carregandoSessao } = useAutenticacao();
  const [visualizacao, definirVisualizacao] = useState<VisualizacaoOcorrencias>(visualizacaoInicial);
  const [origemCarregada, definirOrigemCarregada] = useState<VisualizacaoOcorrencias | null>(null);
  const [autorCarregado, definirAutorCarregado] = useState<string | null>(null);
  const [ocorrenciaSelecionada, definirOcorrenciaSelecionada] = useState<Ocorrencia | null>(null);

  const dadosDaVisualizacaoEstaoCarregados = origemCarregada === visualizacao &&
    (visualizacao === "todas" || Boolean(usuario && autorCarregado === usuario.id));
  const ocorrenciasDaVisualizacao = useMemo(
    () => dadosDaVisualizacaoEstaoCarregados ? ocorrencias : [],
    [dadosDaVisualizacaoEstaoCarregados, ocorrencias],
  );

  const bairrosDisponiveis = useMemo(
    () => [...new Set(ocorrenciasDaVisualizacao.map(({ bairro }) => bairro.trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR")),
    [ocorrenciasDaVisualizacao],
  );
  const categoriasDisponiveis = useMemo(
    () => [...new Set(ocorrenciasDaVisualizacao.map(({ categoria }) => categoria.trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "pt-BR")),
    [ocorrenciasDaVisualizacao],
  );

  const ocorrenciasVisiveis = useMemo(() => {
    const consultaNormalizada = consulta.trim().toLocaleLowerCase("pt-BR");
    return ocorrenciasDaVisualizacao.filter((ocorrencia) => {
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
  }, [consulta, filtroBairro, filtroCategoria, filtroStatus, ocorrenciasDaVisualizacao]);

  const quantidadeFiltrosAtivos =
    Number(filtroStatus !== "Todas") + Number(Boolean(filtroBairro)) + Number(Boolean(filtroCategoria));

  const abrirPainelFiltros = useCallback(() => {
    definirStatusRascunho(filtroStatus);
    definirBairroRascunho(filtroBairro);
    definirCategoriaRascunho(filtroCategoria);
    definirCampoAberto(null);
    definirPainelFiltrosAberto(true);
  }, [filtroBairro, filtroCategoria, filtroStatus]);

  const fecharPainelFiltros = useCallback(() => {
    definirStatusRascunho(filtroStatus);
    definirBairroRascunho(filtroBairro);
    definirCategoriaRascunho(filtroCategoria);
    definirCampoAberto(null);
    definirPainelFiltrosAberto(false);
  }, [filtroBairro, filtroCategoria, filtroStatus]);

  const carregarOcorrencias = useCallback(async (atualizacao = false): Promise<boolean> => {
    if (visualizacao === "minhas" && (!usuario || carregandoSessao)) return false;
    const idRequisicao = ++requisicaoAtual.current;
    if (atualizacao) definirAtualizando(true);
    else definirCarregando(true);
    definirErro(null);
    try {
      const resultado = await executarComCarregamento(
        visualizacao === "minhas" ? listarMinhasOcorrencias : listarOcorrencias,
        atualizacao ? "Atualizando ocorrências" : "Carregando ocorrências",
      );
      if (idRequisicao === requisicaoAtual.current) {
        definirOcorrencias(resultado);
        definirOrigemCarregada(visualizacao);
        definirAutorCarregado(visualizacao === "minhas" ? usuario?.id ?? null : null);
      }
      else return false;
      return true;
    } catch {
      if (idRequisicao === requisicaoAtual.current) {
        definirErro("Não foi possível conectar ao servidor. Tente novamente.");
      }
      return false;
    } finally {
      if (idRequisicao === requisicaoAtual.current) {
        definirCarregando(false);
        definirAtualizando(false);
      }
    }
  }, [carregandoSessao, executarComCarregamento, usuario, visualizacao]);

  const aplicarFiltros = useCallback(async () => {
    const atualizou = await carregarOcorrencias(true);
    if (!atualizou) return;
    definirFiltroStatus(statusRascunho);
    definirFiltroBairro(bairroRascunho);
    definirFiltroCategoria(categoriaRascunho);
    definirPainelFiltrosAberto(false);
  }, [bairroRascunho, carregarOcorrencias, categoriaRascunho, statusRascunho]);

  const limparFiltrosAplicados = useCallback(() => {
    definirConsulta("");
    definirFiltroStatus("Todas");
    definirFiltroBairro("");
    definirFiltroCategoria("");
    definirStatusRascunho("Todas");
    definirBairroRascunho("");
    definirCategoriaRascunho("");
    definirPainelFiltrosAberto(false);
  }, []);

  useFocusEffect(useCallback(() => {
    if (carregandoSessao) return;
    if (visualizacao === "minhas" && !usuario) {
      definirOcorrencias([]);
      definirCarregando(false);
      return;
    }
    void carregarOcorrencias();
    return () => { requisicaoAtual.current += 1; };
  }, [carregandoSessao, carregarOcorrencias, usuario, visualizacao]));

  return (
    <View style={styles.tela}>
      <View style={styles.cabecalhoConteudo}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>BAIRROATIVO</Text>
          <Text style={styles.titulo}>Relatos da comunidade</Text>
          <Text style={styles.descricao}>
            Veja o que está acontecendo nos bairros.
          </Text>
        </View>

        <View style={styles.seletorVisualizacao} accessibilityRole="tablist">
          {(["todas", "minhas"] as const).map((aba) => (
            <Pressable
              key={aba}
              accessibilityRole="tab"
              accessibilityState={{ selected: visualizacao === aba }}
              onPress={() => {
                if (aba === visualizacao) return;
                definirCarregando(true);
                definirErro(null);
                definirVisualizacao(aba);
              }}
              style={[styles.abaVisualizacao, visualizacao === aba && styles.abaVisualizacaoAtiva]}
            >
              <Text style={[styles.rotuloAba, visualizacao === aba && styles.rotuloAbaAtiva]}>
                {aba === "todas" ? "Todas as ocorrências" : "Minhas ocorrências"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.buscaLinha}>
          <View style={styles.buscaCampo}>
            <IconeBusca width={18} height={18} accessibilityElementsHidden />
            <TextInput
              value={consulta}
              onChangeText={definirConsulta}
              placeholder="Buscar ocorrências..."
              placeholderTextColor={styles.placeholder.color}
              style={styles.search}
              accessibilityLabel="Buscar ocorrências"
              returnKeyType="search"
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Filtros${quantidadeFiltrosAtivos ? `, ${quantidadeFiltrosAtivos} ativos` : ""}`}
            accessibilityHint="Abre os filtros de status, bairro e categoria"
            accessibilityState={{ expanded: painelFiltrosAberto }}
            accessibilityValue={{ text: String(quantidadeFiltrosAtivos) }}
            aria-controls="painel-filtros"
            aria-expanded={painelFiltrosAberto}
            onPress={() => painelFiltrosAberto ? fecharPainelFiltros() : abrirPainelFiltros()}
            style={styles.botaoFiltros}
          >
            <IconeFiltros width={19} height={19} fill={cores.primaryDark} accessibilityLabel="" />
            <Text style={styles.rotuloBotaoFiltros}>Filtros</Text>
            {quantidadeFiltrosAtivos ? <View style={styles.contadorFiltros}><Text style={styles.contadorFiltrosTexto}>{quantidadeFiltrosAtivos}</Text></View> : null}
          </Pressable>
        </View>

        {quantidadeFiltrosAtivos ? (
          <Pressable accessibilityRole="button" onPress={abrirPainelFiltros} style={styles.filtrosAtivos}>
            <Text style={styles.filtrosAtivosTexto}>
              {quantidadeFiltrosAtivos} {quantidadeFiltrosAtivos === 1 ? "filtro ativo" : "filtros ativos"}
              {filtroStatus !== "Todas" ? ` · ${rotulosFiltroStatus[filtroStatus]}` : ""}
              {filtroBairro ? ` · ${filtroBairro}` : ""}
              {filtroCategoria ? ` · ${filtroCategoria}` : ""}
            </Text>
            <Text style={styles.editarFiltros}>Editar</Text>
          </Pressable>
        ) : null}

        <View
          testID="painel-filtros"
          nativeID="painel-filtros"
          accessibilityElementsHidden={!painelFiltrosAberto}
          importantForAccessibility={painelFiltrosAberto ? "auto" : "no-hide-descendants"}
          style={[styles.painelFiltros, !painelFiltrosAberto && styles.painelFiltrosFechado]}
        >
            <View style={styles.painelTituloLinha}>
              <Text style={styles.painelTitulo}>Filtrar ocorrências</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar filtros" onPress={fecharPainelFiltros} hitSlop={8}>
                <Text style={styles.fecharFiltros}>×</Text>
              </Pressable>
            </View>
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
                  selected={statusRascunho === filter}
                  onPress={() => definirStatusRascunho(filter)}
                />
              ))}
            </ScrollView>

            <View
              testID="container-filtros-combos"
              style={[styles.filtrosCampos, campoAberto !== null && styles.filtrosCamposAberto]}
            >
              <View style={[styles.filtroCampo, campoAberto === "bairro" && styles.filtroCampoAberto]}>
                <CampoSelecao
                  label="Bairro"
                  placeholder="Todos os bairros"
                  options={bairrosDisponiveis}
                  value={bairroRascunho}
                  onChange={definirBairroRascunho}
                  aberto={campoAberto === "bairro"}
                  exibirLimpar
                  aoAlternar={() => definirCampoAberto((atual) => atual === "bairro" ? null : "bairro")}
                />
              </View>
              <View style={[styles.filtroCampo, campoAberto === "categoria" && styles.filtroCampoAberto]}>
                <CampoSelecao
                  label="Categoria"
                  placeholder="Todas as categorias"
                  options={categoriasDisponiveis}
                  value={categoriaRascunho}
                  onChange={definirCategoriaRascunho}
                  aberto={campoAberto === "categoria"}
                  exibirLimpar
                  aoAlternar={() => definirCampoAberto((atual) => atual === "categoria" ? null : "categoria")}
                />
              </View>
            </View>
            <View style={styles.acoesFiltros}>
              <Botao
                label="Limpar"
                onPress={() => {
                  definirStatusRascunho("Todas");
                  definirBairroRascunho("");
                  definirCategoriaRascunho("");
                  definirCampoAberto(null);
                }}
                variant="ghost"
                size="sm"
              />
              <Botao label="Aplicar filtros" onPress={() => void aplicarFiltros()} size="sm" />
            </View>
        </View>

        <Text style={styles.resultCount}>
          {visualizacao === "minhas" && !usuario
            ? "Entre para consultar sua lista pessoal"
            : `${ocorrenciasVisiveis.length} ${ocorrenciasVisiveis.length === 1 ? "ocorrência" : "ocorrências"}`}
        </Text>
        {erro && ocorrenciasDaVisualizacao.length > 0 ? (
          <View style={styles.erroAtualizacao}>
            <Text style={styles.erroAtualizacaoTexto}>
              Não foi possível atualizar. Os resultados exibidos podem estar desatualizados.
            </Text>
            <Botao label="Tentar novamente" onPress={() => void carregarOcorrencias()} variant="outline" size="xs" />
          </View>
        ) : null}
      </View>

      {visualizacao === "minhas" && carregandoSessao ? (
        <Text accessibilityRole="progressbar" style={[styles.resultCount, styles.avisoLogin]}>Verificando sua conta…</Text>
      ) : null}

      {visualizacao === "minhas" && !carregandoSessao && !usuario ? (
        <View style={styles.avisoLogin}>
          <Text style={styles.emptyTitle}>Entre para ver suas ocorrências</Text>
          <Text style={styles.emptyDescription}>Acesse com sua conta Google para consultar, editar e excluir os registros que você cadastrou. A lista pública continua disponível na opção Todas as ocorrências.</Text>
          <Botao label="Entrar com Google" onPress={() => router.push("/login" as never)} />
        </View>
      ) : null}

      {(visualizacao === "todas" || (Boolean(usuario) && !carregandoSessao)) ? <FlatList
        style={styles.listaOcorrencias}
        contentContainerStyle={styles.list}
        data={ocorrenciasVisiveis}
        keyExtractor={(ocorrencia) => ocorrencia.id}
        renderItem={({ item }) => (
          <CartaoOcorrencia
            ocorrencia={item}
            mostrarOpcoes={visualizacao === "minhas"}
            aoAbrirOpcoes={() => definirOcorrenciaSelecionada(item)}
          />
        )}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => void carregarOcorrencias(true)} />}
        ListEmptyComponent={carregando ? undefined : erro ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Não foi possível carregar</Text>
            <Text style={styles.emptyDescription}>{erro}</Text>
            <Botao label="Tentar novamente" onPress={() => void carregarOcorrencias()} variant="outline" size="sm" />
          </View>
        ) : ocorrenciasDaVisualizacao.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{visualizacao === "minhas" ? "Você ainda não cadastrou ocorrências" : "Nenhuma ocorrência cadastrada"}</Text>
            <Text style={styles.emptyDescription}>{visualizacao === "minhas" ? "Quando você cadastrar ocorrências, elas aparecerão aqui." : "Quando a comunidade publicar ocorrências, elas aparecerão aqui."}</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <IconeBusca width={26} height={26} accessibilityLabel="Buscar" />
            <Text style={styles.emptyTitle}>Nenhuma ocorrência encontrada</Text>
            <Text style={styles.emptyDescription}>
              Tente ajustar a busca ou remover algum filtro.
            </Text>
            <Botao label="Limpar filtros" onPress={limparFiltrosAplicados} variant="outline" size="sm" />
          </View>
        )}
      /> : null}

      <View style={styles.rodapeConteudo}>
        <Text style={styles.disclaimer}>
          O BairroAtivo não é um serviço oficial da prefeitura.
        </Text>
      </View>
      <AcoesOcorrenciaPropria
        key={ocorrenciaSelecionada?.id ?? "nenhuma-ocorrencia"}
        ocorrencia={ocorrenciaSelecionada}
        aoFechar={() => definirOcorrenciaSelecionada(null)}
        aoExcluir={(id) => {
          definirOcorrencias((atuais) => atuais.filter(({ id: atualId }) => atualId !== id));
          definirOcorrenciaSelecionada(null);
        }}
      />
      <NavegacaoInferior ativa="ocorrencias" />
    </View>
  );
}
