import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Botao } from "@/shared/components/ui/Botao";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import IconeCamera from "@/shared/icons/camera_alt_24dp_E3E3E3.svg";
import IconeGaleria from "@/shared/icons/photo_library_24dp_E3E3E3.svg";
import { cores } from "@/configs/tema";
import { CampoSelecao } from "../components/CampoSelecao";
import { categoriasOcorrencia, bairros } from "../data/opcoesOcorrencia";
import { formularioOcorrenciaStyles as styles } from "./FormularioOcorrencia.styles";

export default function FormularioOcorrencia() {
  const [titulo, definirTitulo] = useState("");
  const [descricao, definirDescricao] = useState("");
  const [categoria, definirCategoria] = useState("");
  const [bairro, definirBairro] = useState("");
  const [campoAberto, definirCampoAberto] = useState<"categoria" | "bairro" | null>(null);
  return (
    <View style={{ flex: 1 }}>
    <ScrollView style={styles.rolagem} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.intro}>
        <Text style={styles.titulo}>Nova ocorrência</Text>
        <Text style={styles.descricao}>Descreva o problema do seu bairro. Os campos são apenas uma prévia nesta etapa.</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Título <Text style={styles.required}>*</Text></Text>
        <TextInput
          value={titulo}
          onChangeText={definirTitulo}
          placeholder="Ex.: Buraco na rua"
          placeholderTextColor={styles.placeholder.color}
          style={styles.input}
          maxLength={100}
          accessibilityLabel="Título da ocorrência"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Descrição <Text style={styles.required}>*</Text></Text>
        <TextInput
          value={descricao}
          onChangeText={definirDescricao}
          placeholder="Descreva o problema com mais detalhes..."
          placeholderTextColor={styles.placeholder.color}
          style={[styles.input, styles.multiline]}
          multiline
          textAlignVertical="top"
          maxLength={500}
          accessibilityLabel="Descrição da ocorrência"
        />
        <Text style={styles.counter}>{descricao.length}/500</Text>
      </View>

      <CampoSelecao
        label="Categoria *"
        placeholder="Selecione uma categoria"
        options={categoriasOcorrencia}
        value={categoria}
        onChange={definirCategoria}
        aberto={campoAberto === "categoria"}
        aoAlternar={() => definirCampoAberto((atual) => atual === "categoria" ? null : "categoria")}
      />
      <CampoSelecao
        label="Bairro *"
        placeholder="Selecione um bairro"
        options={bairros}
        value={bairro}
        onChange={definirBairro}
        aberto={campoAberto === "bairro"}
        aoAlternar={() => definirCampoAberto((atual) => atual === "bairro" ? null : "bairro")}
      />

      <View style={styles.field}>
        <Text style={styles.label}>Anexos</Text>
        <View style={styles.botoesAnexo}>
          <Pressable
            accessibilityRole="button"
            disabled
            style={[styles.botaoAnexo, styles.botaoAnexoDesabilitado]}
          >
            <IconeCamera width={20} height={20} fill={cores.primary} />
            <Text style={styles.textoBotaoAnexo}>Câmera</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled
            style={[styles.botaoAnexo, styles.botaoAnexoDesabilitado]}
          >
            <IconeGaleria width={20} height={20} fill={cores.primary} />
            <Text style={styles.textoBotaoAnexo}>Galeria</Text>
          </Pressable>
        </View>
        <Text style={styles.ajudaAnexo}>Anexar imagens estará disponível na etapa de envio de fotos.</Text>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Cadastro indisponível nesta etapa</Text>
        <Text style={styles.noticeText}>O backend ainda será implementado. O que você preencher fica apenas nesta tela e não será enviado nem salvo.</Text>
      </View>

      <Botao label="Cadastrar ocorrência" disabled fullWidth />
    </ScrollView>
    <NavegacaoInferior ativa="registrar" />
    </View>
  );
}







