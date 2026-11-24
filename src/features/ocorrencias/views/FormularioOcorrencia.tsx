import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { Image, Modal, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Botao } from "@/shared/components/ui/Botao";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import { useCarregamentoGlobal } from "@/shared/components/ui/CarregamentoGlobal";
import { useAutenticacao } from "@/features/autenticacao/contexto/AutenticacaoProvider";
import { cores } from "@/configs/tema";
import { CampoSelecao } from "../components/CampoSelecao";
import { capturarLocalizacaoAtual } from "@/shared/services/localizacaoDispositivo";
import { buscarCidadeDoUsuario, listarBairrosDaCidade, obterCidadePorCodigo, sugerirBairro } from "@/shared/services/cidadesSupabase";
import type { Cidade } from "@/shared/services/cidadesSupabase";
import { SeletorLocalizacao } from "../components/SeletorLocalizacao";
import { categoriaBancoPorRotulo, categoriasOcorrencia } from "../data/opcoesOcorrencia";
import { atualizarOcorrencia, cadastrarOcorrencia, validarFotosOcorrencia } from "../services/ocorrenciasSupabase";
import type { FotoOcorrenciaSelecionada } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";
import { validarCadastroOcorrencia } from "../validacoes/cadastroOcorrencia";
import type { DadosCadastroOcorrencia, ErrosCadastroOcorrencia } from "../validacoes/cadastroOcorrencia";
import { formularioOcorrenciaStyles as styles } from "./FormularioOcorrencia.styles";
import InfoIcon from "@/shared/icons/info_24dp_E3E3E3.svg";

export default function FormularioOcorrencia({ ocorrenciaInicial }: { ocorrenciaInicial?: Ocorrencia }) {
  const { usuario } = useAutenticacao();
  const { executarComCarregamento } = useCarregamentoGlobal();
  const [titulo, definirTitulo] = useState(ocorrenciaInicial?.titulo ?? "");
  const [descricao, definirDescricao] = useState(ocorrenciaInicial?.descricao ?? "");
  const [categoriaRotulo, definirCategoriaRotulo] = useState(ocorrenciaInicial?.categoria ?? "");
  const [bairro, definirBairro] = useState(ocorrenciaInicial?.bairro ?? "");
  const [bairroSugerido, definirBairroSugerido] = useState("");
  const [cidade, definirCidade] = useState<Cidade | null>(null);
  const [bairrosDisponiveis, definirBairrosDisponiveis] = useState<string[]>([]);
  const [carregandoCidade, definirCarregandoCidade] = useState(Boolean(usuario?.id));
  const [erroCatalogo, definirErroCatalogo] = useState<string | null>(null);
  const [localizacao, definirLocalizacao] = useState<{ latitude: number; longitude: number } | null>(
    typeof ocorrenciaInicial?.latitude === "number" && typeof ocorrenciaInicial?.longitude === "number"
      ? { latitude: ocorrenciaInicial.latitude, longitude: ocorrenciaInicial.longitude } : null,
  );
  const [exibirNomePublico, definirExibirNomePublico] = useState(Boolean(ocorrenciaInicial?.nomeAutorPublico));
  const [campoAberto, definirCampoAberto] = useState<"categoria" | "bairro" | null>(null);
  const [erros, definirErros] = useState<ErrosCadastroOcorrencia>({});
  const [erroEnvio, definirErroEnvio] = useState<string | null>(null);
  const [salvando, definirSalvando] = useState(false);
  const [fotos, definirFotos] = useState<FotoOcorrenciaSelecionada[]>([]);
  const [erroFotos, definirErroFotos] = useState<string | null>(null);
  const [statusLocalizacao, definirStatusLocalizacao] = useState(ocorrenciaInicial?.latitude !== undefined && ocorrenciaInicial?.longitude !== undefined ? "Local do problema já salvo." : "Obtendo a localização do problema…");
  const [ajudaLocalizacaoAberta, definirAjudaLocalizacaoAberta] = useState(false);
  const localizacaoAlteradaManualmente = useRef(false);
  const envioEmAndamento = useRef(false);

  const nomePerfil = typeof usuario?.user_metadata.full_name === "string"
    ? usuario.user_metadata.full_name
    : typeof usuario?.user_metadata.name === "string"
      ? usuario.user_metadata.name
      : usuario?.email?.split("@")[0] ?? "";
  const dados: DadosCadastroOcorrencia = {
    titulo,
    descricao,
    categoria: categoriaBancoPorRotulo(categoriaRotulo) ?? "",
    bairro: bairro === "__bairro_sugerido__" ? bairroSugerido : bairro,
    nomePublico: exibirNomePublico ? nomePerfil : null,
    latitude: localizacao?.latitude ?? null,
    longitude: localizacao?.longitude ?? null,
    cidadeIbge: ocorrenciaInicial?.cidadeIbge ?? cidade?.codigoIbge ?? null,
  };

  useEffect(() => {
    if (!usuario?.id) return;
    let ativa = true;
    const carregarCidade = ocorrenciaInicial?.cidadeIbge
      ? obterCidadePorCodigo(ocorrenciaInicial.cidadeIbge)
      : buscarCidadeDoUsuario(usuario.id);
    void carregarCidade.then(async (cidadeAtual) => {
      const bairrosDaCidade = cidadeAtual ? await listarBairrosDaCidade(cidadeAtual.codigoIbge) : [];
      if (ativa) { definirCidade(cidadeAtual); definirBairrosDisponiveis(bairrosDaCidade); }
    }).catch((falha: unknown) => { if (ativa) definirErroCatalogo(falha instanceof Error ? falha.message : "Não foi possível carregar cidade e bairros."); })
      .finally(() => { if (ativa) definirCarregandoCidade(false); });
    return () => { ativa = false; };
  }, [ocorrenciaInicial?.cidadeIbge, usuario?.id]);

  useEffect(() => {
    if (!usuario?.id || localizacao) return;
    let ativa = true;
    void capturarLocalizacaoAtual().then((ponto) => {
      if (!ativa || localizacaoAlteradaManualmente.current) return;
      definirLocalizacao(ponto);
      definirStatusLocalizacao("Local do problema capturado automaticamente. Você pode ajustar o marcador no mapa.");
    }).catch(() => {
      if (ativa && !localizacaoAlteradaManualmente.current) definirStatusLocalizacao(Platform.OS === "web" ? "Não foi possível obter sua localização. Verifique a permissão do navegador e recarregue a página." : "Não foi possível obter sua localização. Toque no mapa para marcar o local do problema.");
    });
    return () => { ativa = false; };
  }, [localizacao, usuario?.id]);

  function alterarLocalizacao(ponto: { latitude: number; longitude: number } | null) {
    localizacaoAlteradaManualmente.current = true;
    definirLocalizacao(ponto);
    definirStatusLocalizacao(ponto ? "Local do problema marcado no mapa." : "Marque o local do problema no mapa para continuar.");
  }

  function adicionarFotosSelecionadas(assets: ImagePicker.ImagePickerAsset[]) {
    const selecionadas = assets.map(({ uri, mimeType, fileSize, fileName }) => ({ uri, mimeType, fileSize, fileName }));
    const proximas = [...fotos, ...selecionadas];
    const erro = validarFotosOcorrencia(proximas);
    if (erro) {
      definirErroFotos(erro);
      return;
    }
    definirErroFotos(null);
    definirFotos(proximas);
  }

  async function selecionarFotos() {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) {
        definirErroFotos("Permita o acesso à galeria para anexar fotos.");
        return;
      }
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: Math.max(1, 5 - fotos.length),
        quality: 0.8,
        exif: false,
      });
      if (!resultado.canceled) adicionarFotosSelecionadas(resultado.assets);
    } catch {
      definirErroFotos("Não foi possível abrir a galeria. Tente novamente.");
    }
  }

  async function fotografar() {
    try {
      const permissao = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissao.granted) {
        definirErroFotos("Permita o acesso à câmera para fotografar a ocorrência.");
        return;
      }
      const resultado = await ImagePicker.launchCameraAsync({ quality: 0.8, exif: false });
      if (!resultado.canceled) adicionarFotosSelecionadas(resultado.assets);
    } catch {
      definirErroFotos("Não foi possível abrir a câmera. Tente novamente.");
    }
  }

  async function enviarCadastro() {
    if (envioEmAndamento.current) return;
    const errosValidacao = validarCadastroOcorrencia(dados);
    definirErros(errosValidacao);
    definirErroEnvio(null);
    const erroValidacaoFotos = validarFotosOcorrencia(fotos);
    definirErroFotos(erroValidacaoFotos);
    if (erroValidacaoFotos) return;
    if (Object.keys(errosValidacao).length > 0) return;

    envioEmAndamento.current = true;
    definirSalvando(true);
    try {
      if (bairro === "__bairro_sugerido__" && usuario?.id && dados.cidadeIbge) {
        await sugerirBairro(usuario.id, dados.cidadeIbge, bairroSugerido);
      }
      const resultado = await executarComCarregamento(
        () => ocorrenciaInicial
          ? atualizarOcorrencia(ocorrenciaInicial.id, dados, undefined, fotos)
          : cadastrarOcorrencia(dados, undefined, fotos),
        ocorrenciaInicial ? "Salvando alterações" : "Cadastrando ocorrência",
      );
      if (ocorrenciaInicial) {
        router.replace({ pathname: "/ocorrencias/[id]", params: { id: resultado.id } });
        return;
      }
      router.replace("/ocorrencias" as never);
    } catch (erro) {
      definirErroEnvio(
        erro instanceof Error
          ? erro.message
          : "Não foi possível cadastrar a ocorrência. Tente novamente.",
      );
    } finally {
      envioEmAndamento.current = false;
      definirSalvando(false);
    }
  }

  return (
    <View style={styles.tela}>
      <ScrollView style={styles.rolagem} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.intro}>
            <Text style={styles.titulo}>{ocorrenciaInicial ? "Editar ocorrência" : "Nova ocorrência"}</Text>
            <Text style={styles.descricao}>
              {ocorrenciaInicial
                ? "Atualize os dados do problema registrado."
                : "Descreva o problema do seu bairro para publicá-lo no BairroAtivo."}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Título <Text style={styles.required}>*</Text></Text>
            <TextInput
              accessibilityLabel="Título da ocorrência"
              value={titulo}
              onChangeText={definirTitulo}
              placeholder="Ex.: Buraco na rua"
              placeholderTextColor={styles.placeholder.color}
              style={styles.input}
              maxLength={150}
              editable={!salvando}
              returnKeyType="next"
            />
            {erros.titulo ? <Text style={styles.fieldError}>{erros.titulo}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descrição <Text style={styles.required}>*</Text></Text>
            <TextInput
              accessibilityLabel="Descrição da ocorrência"
              value={descricao}
              onChangeText={definirDescricao}
              placeholder="Descreva o problema com mais detalhes..."
              placeholderTextColor={styles.placeholder.color}
              style={[styles.input, styles.multiline]}
              multiline
              textAlignVertical="top"
              maxLength={3000}
              editable={!salvando}
            />
            <Text style={styles.counter}>{descricao.length}/3000</Text>
            {erros.descricao ? <Text style={styles.fieldError}>{erros.descricao}</Text> : null}
          </View>

          <View style={[styles.field, campoAberto === "categoria" && styles.fieldAberto]}>
            <CampoSelecao
              label="Categoria *"
              placeholder="Selecione uma categoria"
              options={categoriasOcorrencia.map(({ rotulo }) => rotulo)}
              value={categoriaRotulo}
              onChange={definirCategoriaRotulo}
              aberto={campoAberto === "categoria"}
              aoAlternar={() => definirCampoAberto((atual) => atual === "categoria" ? null : "categoria")}
            />
            {erros.categoria ? <Text style={styles.fieldError}>{erros.categoria}</Text> : null}
          </View>

          <View style={[styles.field, campoAberto === "bairro" && styles.fieldAberto]}>
            <CampoSelecao
              label="Bairro *"
              placeholder="Selecione um bairro"
              options={[...bairrosDisponiveis, "Meu bairro não aparece"]}
              value={bairro === "__bairro_sugerido__" ? "Meu bairro não aparece" : bairro}
              onChange={(valor) => definirBairro(valor === "Meu bairro não aparece" ? "__bairro_sugerido__" : valor)}
              aberto={campoAberto === "bairro"}
              aoAlternar={() => definirCampoAberto((atual) => atual === "bairro" ? null : "bairro")}
            />
            {erros.bairro ? <Text style={styles.fieldError}>{erros.bairro}</Text> : null}
            {bairro === "__bairro_sugerido__" ? <TextInput accessibilityLabel="Nome do bairro sugerido" value={bairroSugerido} onChangeText={definirBairroSugerido} placeholder="Digite o nome do bairro" placeholderTextColor={styles.placeholder.color} style={styles.input} maxLength={120} editable={!salvando} /> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Cidade vinculada ao perfil</Text>
            {carregandoCidade ? <Text style={styles.fotosAjuda}>Carregando cidade…</Text> : cidade ? <Text style={styles.fotosAjuda}>{cidade.nome}, {cidade.uf}. Os bairros e relatos são carregados para esta cidade.</Text> : <View style={{ gap: 8 }}><Text style={styles.fotosAjuda}>Escolha sua cidade no perfil para carregar os bairros.</Text><Botao label="Definir minha cidade" onPress={() => router.push("/perfil" as never)} variant="outline" size="sm" /></View>}
            {erroCatalogo ? <Text accessibilityRole="alert" style={styles.fieldError}>{erroCatalogo}</Text> : null}
            {erros.cidade ? <Text accessibilityRole="alert" style={styles.fieldError}>{erros.cidade}</Text> : null}
          </View>

          <View style={styles.field}>
            <View style={styles.rotuloComAjuda}>
              <Text style={styles.label}>Local do problema</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Informações sobre a localização"
                onPress={() => definirAjudaLocalizacaoAberta(true)}
                style={styles.botaoAjuda}
              >
                <InfoIcon width={18} height={18} fill={cores.primary} />
              </Pressable>
            </View>
            <SeletorLocalizacao latitude={localizacao?.latitude ?? null} longitude={localizacao?.longitude ?? null} onChange={alterarLocalizacao} disabled={salvando} status={statusLocalizacao} bairro={bairro === "__bairro_sugerido__" ? bairroSugerido : bairro} cidade={cidade ? `${cidade.nome}, ${cidade.uf}` : undefined} />
            {erros.localizacao ? <Text style={styles.fieldError}>{erros.localizacao}</Text> : null}
          </View>

          <Modal visible={ajudaLocalizacaoAberta} transparent animationType="fade" onRequestClose={() => definirAjudaLocalizacaoAberta(false)}>
            <View style={styles.modalSobreposicao}>
              <View accessibilityViewIsModal style={styles.modalAjuda}>
                <View style={styles.modalCabecalho}>
                  <Text style={styles.modalTitulo}>Sobre a localização</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Fechar informações sobre a localização" onPress={() => definirAjudaLocalizacaoAberta(false)} style={styles.fecharAjuda}>
                    <Text style={styles.fecharAjudaTexto}>×</Text>
                  </Pressable>
                </View>
                <Text style={styles.modalTexto}>A localização é usada somente para registrar o problema. O BairroAtivo não acompanha o aparelho em segundo plano.</Text>
                <Text style={styles.modalTexto}>O mapa interativo aparece no app móvel: toque em “Marcar o local no mapa” para escolher ou ajustar o ponto. No navegador, permita o acesso à localização para preencher o local automaticamente; o mapa interativo ainda não está disponível nessa versão.</Text>
                <Botao label="Entendi" onPress={() => definirAjudaLocalizacaoAberta(false)} fullWidth size="sm" />
              </View>
            </View>
          </Modal>

          <View style={styles.field}>
            <Text style={styles.label}>Fotos (opcional)</Text>
            <Text style={styles.fotosAjuda}>Até 5 imagens JPG, PNG ou WebP, com no máximo 5 MB cada.</Text>
            <View style={styles.acoesFotos}>
              <Pressable accessibilityRole="button" accessibilityLabel="Selecionar fotos da galeria" onPress={() => void selecionarFotos()} disabled={salvando} style={styles.botaoFoto}>
                <Text style={styles.botaoFotoTexto}>Escolher da galeria</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Fotografar ocorrência" onPress={() => void fotografar()} disabled={salvando} style={styles.botaoFoto}>
                <Text style={styles.botaoFotoTexto}>Tirar foto</Text>
              </Pressable>
            </View>
            {fotos.length > 0 ? (
              <ScrollView horizontal contentContainerStyle={styles.listaFotos} showsHorizontalScrollIndicator={false}>
                {fotos.map((foto, indice) => (
                  <View key={`${foto.uri}-${indice}`} style={styles.fotoSelecionada}>
                    <Image source={{ uri: foto.uri }} style={styles.fotoMiniatura} accessibilityLabel={`Foto selecionada ${indice + 1}`} />
                    <Pressable accessibilityRole="button" accessibilityLabel={`Remover foto ${indice + 1}`} onPress={() => definirFotos((atuais) => atuais.filter((_, posicao) => posicao !== indice))} style={styles.removerFoto}>
                      <Text style={styles.removerFotoTexto}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            ) : null}
            {erroFotos ? <Text accessibilityRole="alert" style={styles.fieldError}>{erroFotos}</Text> : null}
          </View>

          <View style={styles.privacidade}>
            <Switch
              accessibilityLabel="Exibir meu nome publicamente"
              value={exibirNomePublico}
              onValueChange={definirExibirNomePublico}
              disabled={salvando}
              trackColor={{ false: cores.border, true: cores.primary }}
              thumbColor={cores.surface}
            />
            <View style={styles.privacidadeTexto}>
              <Text style={styles.privacidadeTitulo}>Exibir meu nome publicamente</Text>
              <Text style={styles.privacidadeDescricao}>
                {exibirNomePublico && nomePerfil
                  ? `Seu nome aparecerá como autor: ${nomePerfil}.`
                  : "Seu nome não será exibido junto à ocorrência."}
              </Text>
              {erros.nomePublico ? <Text style={styles.fieldError}>{erros.nomePublico}</Text> : null}
            </View>
          </View>

          {erroEnvio ? <Text accessibilityRole="alert" style={styles.submitError}>{erroEnvio}</Text> : null}
          <Botao
            label={salvando ? "Salvando..." : ocorrenciaInicial ? "Salvar alterações" : "Cadastrar ocorrência"}
            onPress={() => void enviarCadastro()}
            disabled={salvando}
            fullWidth
            size="lg"
          />
      </ScrollView>
      <NavegacaoInferior ativa="registrar" />
    </View>
  );
}
