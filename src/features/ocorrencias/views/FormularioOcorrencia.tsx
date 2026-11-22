import { useRef, useState } from "react";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Botao } from "@/shared/components/ui/Botao";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import { useCarregamentoGlobal } from "@/shared/components/ui/CarregamentoGlobal";
import { useAutenticacao } from "@/features/autenticacao/contexto/AutenticacaoProvider";
import { cores } from "@/configs/tema";
import { CampoSelecao } from "../components/CampoSelecao";
import { bairros, categoriaBancoPorRotulo, categoriasOcorrencia } from "../data/opcoesOcorrencia";
import { atualizarOcorrencia, cadastrarOcorrencia, validarFotosOcorrencia } from "../services/ocorrenciasSupabase";
import type { FotoOcorrenciaSelecionada } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";
import { validarCadastroOcorrencia } from "../validacoes/cadastroOcorrencia";
import type { DadosCadastroOcorrencia, ErrosCadastroOcorrencia } from "../validacoes/cadastroOcorrencia";
import { formularioOcorrenciaStyles as styles } from "./FormularioOcorrencia.styles";

export default function FormularioOcorrencia({ ocorrenciaInicial }: { ocorrenciaInicial?: Ocorrencia }) {
  const { usuario } = useAutenticacao();
  const { executarComCarregamento } = useCarregamentoGlobal();
  const [titulo, definirTitulo] = useState(ocorrenciaInicial?.titulo ?? "");
  const [descricao, definirDescricao] = useState(ocorrenciaInicial?.descricao ?? "");
  const [categoriaRotulo, definirCategoriaRotulo] = useState(ocorrenciaInicial?.categoria ?? "");
  const [bairro, definirBairro] = useState(ocorrenciaInicial?.bairro ?? "");
  const [exibirNomePublico, definirExibirNomePublico] = useState(Boolean(ocorrenciaInicial?.nomeAutorPublico));
  const [campoAberto, definirCampoAberto] = useState<"categoria" | "bairro" | null>(null);
  const [erros, definirErros] = useState<ErrosCadastroOcorrencia>({});
  const [erroEnvio, definirErroEnvio] = useState<string | null>(null);
  const [salvando, definirSalvando] = useState(false);
  const [fotos, definirFotos] = useState<FotoOcorrenciaSelecionada[]>([]);
  const [erroFotos, definirErroFotos] = useState<string | null>(null);
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
    bairro,
    nomePublico: exibirNomePublico ? nomePerfil : null,
  };

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
              options={bairros}
              value={bairro}
              onChange={definirBairro}
              aberto={campoAberto === "bairro"}
              aoAlternar={() => definirCampoAberto((atual) => atual === "bairro" ? null : "bairro")}
            />
            {erros.bairro ? <Text style={styles.fieldError}>{erros.bairro}</Text> : null}
          </View>

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
