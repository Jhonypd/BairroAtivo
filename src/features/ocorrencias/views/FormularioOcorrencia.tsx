import { useRef, useState } from "react";
import { router } from "expo-router";
import { ScrollView, Switch, Text, TextInput, View } from "react-native";
import { Botao } from "@/shared/components/ui/Botao";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import { useCarregamentoGlobal } from "@/shared/components/ui/CarregamentoGlobal";
import { useAutenticacao } from "@/features/autenticacao/contexto/AutenticacaoProvider";
import { cores } from "@/configs/tema";
import { CampoSelecao } from "../components/CampoSelecao";
import { bairros, categoriaBancoPorRotulo, categoriasOcorrencia } from "../data/opcoesOcorrencia";
import { cadastrarOcorrencia } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";
import { validarCadastroOcorrencia } from "../validacoes/cadastroOcorrencia";
import type { DadosCadastroOcorrencia, ErrosCadastroOcorrencia } from "../validacoes/cadastroOcorrencia";
import { formularioOcorrenciaStyles as styles } from "./FormularioOcorrencia.styles";

export default function FormularioOcorrencia() {
  const { usuario } = useAutenticacao();
  const { executarComCarregamento } = useCarregamentoGlobal();
  const [titulo, definirTitulo] = useState("");
  const [descricao, definirDescricao] = useState("");
  const [categoriaRotulo, definirCategoriaRotulo] = useState("");
  const [bairro, definirBairro] = useState("");
  const [exibirNomePublico, definirExibirNomePublico] = useState(false);
  const [campoAberto, definirCampoAberto] = useState<"categoria" | "bairro" | null>(null);
  const [erros, definirErros] = useState<ErrosCadastroOcorrencia>({});
  const [erroEnvio, definirErroEnvio] = useState<string | null>(null);
  const [salvando, definirSalvando] = useState(false);
  const [ocorrenciaCriada, definirOcorrenciaCriada] = useState<Ocorrencia | null>(null);
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

  async function enviarCadastro() {
    if (envioEmAndamento.current) return;
    const errosValidacao = validarCadastroOcorrencia(dados);
    definirErros(errosValidacao);
    definirErroEnvio(null);
    if (Object.keys(errosValidacao).length > 0) return;

    envioEmAndamento.current = true;
    definirSalvando(true);
    try {
      const resultado = await executarComCarregamento(
        () => cadastrarOcorrencia(dados),
        "Cadastrando ocorrência",
      );
      definirOcorrenciaCriada(resultado);
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

  function verDetalhes() {
    if (!ocorrenciaCriada) return;
    router.replace({ pathname: "/ocorrencias/[id]", params: { id: ocorrenciaCriada.id } });
  }

  function verListagem() {
    router.replace("/ocorrencias");
  }

  return (
    <View style={styles.tela}>
      {ocorrenciaCriada ? (
        <View style={styles.confirmacao}>
          <View style={styles.confirmacaoConteudo}>
            <Text style={styles.confirmacaoTitulo}>Ocorrência cadastrada!</Text>
            <Text style={styles.confirmacaoDescricao}>
              “{ocorrenciaCriada.titulo}” foi publicada e já pode ser consultada pela comunidade.
            </Text>
          </View>
          <Botao label="Ver detalhes" onPress={verDetalhes} fullWidth />
          <Botao label="Ver ocorrências" onPress={verListagem} variant="outline" fullWidth />
        </View>
      ) : (
        <ScrollView style={styles.rolagem} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.intro}>
            <Text style={styles.titulo}>Nova ocorrência</Text>
            <Text style={styles.descricao}>
              Descreva o problema do seu bairro para publicá-lo no BairroAtivo.
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

          <View style={styles.field}>
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

          <View style={styles.field}>
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
            label={salvando ? "Cadastrando..." : "Cadastrar ocorrência"}
            onPress={() => void enviarCadastro()}
            disabled={salvando}
            fullWidth
            size="lg"
          />
        </ScrollView>
      )}
      <NavegacaoInferior ativa="registrar" />
    </View>
  );
}
