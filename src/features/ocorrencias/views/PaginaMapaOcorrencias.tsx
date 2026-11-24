import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { listarOcorrencias } from "../services/ocorrenciasSupabase";
import type { Ocorrencia } from "../types/Ocorrencia";
import MapaOcorrencias from "../components/MapaOcorrencias";
import { cores } from "@/configs/tema";
import { useAutenticacao } from "@/features/autenticacao/contexto/AutenticacaoProvider";
import { buscarCidadeDoUsuario, ehSchemaCidadeIndisponivel, obterCidadePublicaPadrao } from "@/shared/services/cidadesSupabase";

export default function PaginaMapaOcorrencias() {
  const parametros = useLocalSearchParams<{
    focoOcorrenciaId?: string | string[];
    focoLat?: string | string[];
    focoLon?: string | string[];
    focoTitulo?: string | string[];
    focoBairro?: string | string[];
  }>();
  const valorParametro = (valor?: string | string[]) => Array.isArray(valor) ? valor[0] : valor;
  const focoId = valorParametro(parametros.focoOcorrenciaId);
  const focoLatitude = Number(valorParametro(parametros.focoLat));
  const focoLongitude = Number(valorParametro(parametros.focoLon));
  const foco = Number.isFinite(focoLatitude) && focoLatitude >= -90 && focoLatitude <= 90
    && Number.isFinite(focoLongitude) && focoLongitude >= -180 && focoLongitude <= 180
    ? {
        id: focoId,
        latitude: focoLatitude,
        longitude: focoLongitude,
        titulo: valorParametro(parametros.focoTitulo),
        bairro: valorParametro(parametros.focoBairro),
      }
    : undefined;
  const [ocorrencias, definirOcorrencias] = useState<Ocorrencia[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState(false);
  const { usuario } = useAutenticacao();
  useEffect(() => {
    let ativa = true;
    void (async () => {
      try {
        const cidadeDoPerfil = usuario ? await buscarCidadeDoUsuario(usuario.id) : null;
        const cidade = cidadeDoPerfil ?? await obterCidadePublicaPadrao();
        return await listarOcorrencias({ cidadeIbge: cidade.codigoIbge });
      } catch (falha) {
        if (ehSchemaCidadeIndisponivel(falha)) return listarOcorrencias();
        throw falha;
      }
    })().then((itens) => { if (ativa) definirOcorrencias(itens); }).catch(() => { if (ativa) definirErro(true); }).finally(() => { if (ativa) definirCarregando(false); });
    return () => { ativa = false; };
  }, [usuario, usuario?.id]);
  if (carregando) return <View style={{ flex: 1, padding: 20, backgroundColor: cores.background }}><Text style={{ color: cores.primaryDark }}>Carregando ocorrências...</Text></View>;
  if (erro) return <View style={{ flex: 1, padding: 20, backgroundColor: cores.background }}><Text style={{ color: cores.error }}>Não foi possível carregar as ocorrências. Volte à lista e tente novamente.</Text></View>;
  const comLocalizacao = ocorrencias.filter((item) => typeof item.latitude === "number" && Number.isFinite(item.latitude) && item.latitude >= -90 && item.latitude <= 90 && typeof item.longitude === "number" && Number.isFinite(item.longitude) && item.longitude >= -180 && item.longitude <= 180);
  return <MapaOcorrencias ocorrencias={comLocalizacao} foco={foco} />;
}
