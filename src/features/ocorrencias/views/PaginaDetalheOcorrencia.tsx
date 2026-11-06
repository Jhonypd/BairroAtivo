import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";
import { NavegacaoInferior } from "@/shared/components/NavegacaoInferior";
import { Botao } from "@/shared/components/ui/Botao";
import { buscarOcorrenciaPorId } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";
import { paginaDetalheOcorrenciaStyles as styles } from "./PaginaDetalheOcorrencia.styles";
import { cores } from "@/configs/tema";
import { useCarregamentoGlobal } from "@/shared/components/ui/CarregamentoGlobal";
import IconeLocalizacao from "@/shared/icons/location_on_24dp_E3E3E3.svg";
import IconeCategoria from "@/shared/icons/category_24dp_E3E3E3.svg";
import IconeData from "@/shared/icons/assignment_24dp_E3E3E3.svg";
import IconeDescricao from "@/shared/icons/info_24dp_E3E3E3.svg";
import IconeFoto from "@/shared/icons/photo_library_24dp_E3E3E3.svg";

const estilosStatus: Record<Ocorrencia["status"], { texto: string; fundo: string }> = {
  Aberta: { texto: cores.statusOpen, fundo: "#FCE8E6" },
  "Em acompanhamento": { texto: "#7A5A00", fundo: "#FFF2CC" },
  Resolvida: { texto: cores.statusResolved, fundo: "#E1F3E7" },
};

function LinhaInformacao({
  Icone,
  titulo,
  valor,
}: {
  Icone: ComponentType<SvgProps>;
  titulo: string;
  valor: string;
}) {
  return (
    <View style={styles.linhaInformacao}>
      <View style={styles.iconeInformacao}>
        <Icone width={18} height={18} fill={cores.textMuted} />
      </View>
      <View style={styles.textosInformacao}>
        <Text style={styles.label}>{titulo}</Text>
        <Text style={styles.value}>{valor}</Text>
      </View>
    </View>
  );
}

export default function PaginaDetalheOcorrencia() {
  const { id: idRota } = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(idRota) ? idRota[0] : idRota;
  const [ocorrencia, definirOcorrencia] = useState<Ocorrencia | null>(null);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState(false);
  const insets = useSafeAreaInsets();
  const { executarComCarregamento } = useCarregamentoGlobal();

  useEffect(() => {
    let ativa = true;
    if (!id) {
      return () => { ativa = false; };
    }
    executarComCarregamento(() => buscarOcorrenciaPorId(id), "Carregando ocorrência")
      .then((resultado) => { if (ativa) definirOcorrencia(resultado); })
      .catch(() => { if (ativa) definirErro(true); })
      .finally(() => { if (ativa) definirCarregando(false); });
    return () => { ativa = false; };
  }, [id, executarComCarregamento]);

  function voltarParaOcorrencias() {
    if (router.canGoBack()) router.back();
    else router.replace("/ocorrencias");
  }

  const cabecalho = (
    <View style={[styles.cabecalho, { paddingTop: Math.max(insets.top, 8) }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar para ocorrências"
        onPress={voltarParaOcorrencias}
        hitSlop={8}
        style={styles.voltar}
      >
        <Text style={styles.setaVoltar}>‹</Text>
      </Pressable>
      <Text style={styles.marca}>BAIRROATIVO</Text>
      <View style={styles.espacadorCabecalho} />
    </View>
  );

  if (carregando && id && !erro) return null;

  if (!id || erro || !ocorrencia) {
    return (
      <View style={styles.tela}>
        <Stack.Screen options={{ headerShown: false }} />
        {cabecalho}
        <View style={styles.notFound}>
          <Text style={styles.tituloErro}>
            {!id
              ? "Identificador da ocorrência inválido"
              : erro
                ? "Não foi possível carregar a ocorrência"
                : "Nenhuma ocorrência encontrada"}
          </Text>
          <Botao
            label="Voltar às ocorrências"
            onPress={voltarParaOcorrencias}
            variant="outline"
            size="sm"
          />
        </View>
        <NavegacaoInferior ativa="ocorrencias" />
      </View>
    );
  }

  return (
    <View style={styles.tela}>
      <Stack.Screen options={{ headerShown: false }} />
      {cabecalho}
      <ScrollView contentContainerStyle={styles.container}>
        {ocorrencia.imagemUrl ? (
          <Image
            source={{ uri: ocorrencia.imagemUrl }}
            style={styles.imagem}
            resizeMode="cover"
            accessibilityLabel={`Foto de ${ocorrencia.titulo}`}
          />
        ) : (
          <View style={styles.imagemVazia} accessible accessibilityLabel="Foto não disponível">
            <IconeFoto width={36} height={36} fill={cores.textSubtle} />
            <Text style={styles.imagemVaziaTexto}>Foto não disponível</Text>
          </View>
        )}

        <View style={styles.tituloLinha}>
          <Text style={styles.titulo} numberOfLines={2}>{ocorrencia.titulo}</Text>
          <Text style={[styles.status, {
            color: estilosStatus[ocorrencia.status].texto,
            backgroundColor: estilosStatus[ocorrencia.status].fundo,
          }]}>
            {ocorrencia.status}
          </Text>
        </View>

        <View style={styles.informacoes}>
          <LinhaInformacao Icone={IconeLocalizacao} titulo="Bairro" valor={ocorrencia.bairro} />
          <LinhaInformacao Icone={IconeCategoria} titulo="Categoria" valor={ocorrencia.categoria} />
          <LinhaInformacao Icone={IconeData} titulo="Data de registro" valor={ocorrencia.registradaEm} />
          <View style={styles.linhaInformacao}>
            <View style={styles.iconeInformacao}>
              <IconeDescricao width={18} height={18} fill={cores.textMuted} />
            </View>
            <View style={styles.textosInformacao}>
              <Text style={styles.label}>Descrição</Text>
              <Text style={styles.descricao}>{ocorrencia.descricao}</Text>
            </View>
          </View>
          {ocorrencia.nomeAutorPublico ? (
            <View style={styles.autorBox}>
              <Text style={styles.autorLabel}>Publicado por</Text>
              <Text style={styles.autor}>{ocorrencia.nomeAutorPublico}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.localizacaoCard}>
          <View style={styles.iconeLocalizacaoCard}>
            <IconeLocalizacao width={20} height={20} fill={cores.surface} />
          </View>
          <View style={styles.textosLocalizacaoCard}>
            <Text style={styles.localizacaoTitulo}>Região informada: {ocorrencia.bairro}</Text>
            <Text style={styles.localizacaoSubtitulo}>Localização aproximada</Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          O BairroAtivo não é um serviço oficial da prefeitura.
        </Text>
      </ScrollView>
      <NavegacaoInferior ativa="ocorrencias" />
    </View>
  );
}
