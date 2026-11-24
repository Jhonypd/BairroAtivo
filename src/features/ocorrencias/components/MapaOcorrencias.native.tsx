import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Camera, Map, Marker, type CameraRef } from "@maplibre/maplibre-react-native";
import type { Ocorrencia } from "../types/Ocorrencia";
import { cores } from "@/configs/tema";
import { estiloMapaUrl } from "@/configs/mapa";
import { capturarLocalizacaoAtual } from "@/shared/services/localizacaoDispositivo";

type Coordenadas = { latitude: number; longitude: number };
const centroBrusque: [number, number] = [-48.917, -27.096];
type FocoMapa = { id?: string; latitude: number; longitude: number; titulo?: string; bairro?: string };
const styles = {
  tela: { flex: 1, backgroundColor: cores.background },
  mapa: { flex: 1 },
  controles: { position: "absolute" as const, top: 16, right: 16, gap: 10 },
  controle: { width: 48, height: 48, alignItems: "center" as const, justifyContent: "center" as const, borderRadius: 24, borderWidth: 1, borderColor: cores.border, backgroundColor: cores.surface, elevation: 4 },
  controleTexto: { color: cores.primaryDark, fontSize: 22, fontWeight: "700" as const },
  aviso: { position: "absolute" as const, top: 16, left: 16, right: 78, flexDirection: "row" as const, alignItems: "center" as const, gap: 8, padding: 12, borderRadius: 12, backgroundColor: cores.surface, elevation: 3 },
  avisoTexto: { flex: 1, color: cores.primaryDark, fontSize: 12, lineHeight: 16 } as const,
};

export default function MapaOcorrencias({ ocorrencias, foco }: { ocorrencias: Ocorrencia[]; foco?: FocoMapa }) {
  const [localizacaoAtual, definirLocalizacaoAtual] = useState<Coordenadas | null>(null);
  const [buscandoLocalizacao, definirBuscandoLocalizacao] = useState(false);
  const [mensagemLocalizacao, definirMensagemLocalizacao] = useState("");
  const [zoomAtual, definirZoomAtual] = useState(13);
  const cameraRef = useRef<CameraRef | null>(null);
  const mapaPronto = useRef(false);
  const centroPendente = useRef<[number, number] | null>(null);

  const localizadas = ocorrencias.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
  const longitudes = localizadas.map((item) => item.longitude!);
  const latitudes = localizadas.map((item) => item.latitude!);
  const extensao = localizadas.length ? Math.max(Math.max(...longitudes) - Math.min(...longitudes), Math.max(...latitudes) - Math.min(...latitudes)) : 0;
  const zoomInicial = foco ? 16 : localizadas.length > 1 ? Math.max(4, Math.min(16, 14 - Math.log2(Math.max(extensao / 0.04, 1)))) : localizadas.length === 1 ? 14 : 13;
  const centro: [number, number] = foco
    ? [foco.longitude, foco.latitude]
    : localizadas.length
      ? [(Math.min(...longitudes) + Math.max(...longitudes)) / 2, (Math.min(...latitudes) + Math.max(...latitudes)) / 2]
      : centroBrusque;
  const focoJaEstaNaLista = Boolean(foco?.id && localizadas.some((item) => item.id === foco.id));

  function centralizar(coordenadas: Coordenadas) {
    const novoCentro: [number, number] = [coordenadas.longitude, coordenadas.latitude];
    definirZoomAtual(16);
    if (!mapaPronto.current || !cameraRef.current) {
      centroPendente.current = novoCentro;
      return;
    }
    cameraRef.current.flyTo({ center: novoCentro, zoom: 16, duration: 650 });
  }

  function mapaCarregado() {
    mapaPronto.current = true;
    if (centroPendente.current) {
      cameraRef.current?.flyTo({ center: centroPendente.current, zoom: 16, duration: 650 });
      centroPendente.current = null;
    }
  }

  async function centralizarNaMinhaLocalizacao() {
    definirBuscandoLocalizacao(true);
    definirMensagemLocalizacao("Buscando a localização atual do aparelho…");
    try {
      const atual = await capturarLocalizacaoAtual();
      definirLocalizacaoAtual(atual);
      definirMensagemLocalizacao("Ponto azul: sua posição atual.");
      centralizar(atual);
    } catch {
      definirMensagemLocalizacao("Não foi possível obter sua localização. Confira a permissão do aparelho.");
    } finally {
      definirBuscandoLocalizacao(false);
    }
  }

  function ajustarZoom(incremento: number) {
    const novoZoom = Math.max(3, Math.min(20, zoomAtual + incremento));
    definirZoomAtual(novoZoom);
    cameraRef.current?.zoomTo(novoZoom, { duration: 200 });
  }

  return <View style={styles.tela}>
    <Map
      style={styles.mapa}
      mapStyle={estiloMapaUrl}
      attribution
      logo
      compass
      compassPosition={{ top: 16, left: 16 }}
      androidView="texture"
      onDidFinishLoadingMap={mapaCarregado}
      onRegionDidChange={(evento) => definirZoomAtual(evento.nativeEvent.zoom)}
    >
      <Camera ref={cameraRef} initialViewState={{ center: centro, zoom: zoomInicial }} minZoom={3} maxZoom={20} />
      {localizadas.map((item) => <Marker key={item.id} id={item.id} lngLat={[item.longitude!, item.latitude!]} onPress={() => router.push({ pathname: "/ocorrencias/[id]", params: { id: item.id } })}>
        <View style={{ maxWidth: 240, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: cores.primary, backgroundColor: cores.surface }}>
          <Text numberOfLines={1} style={{ color: cores.primaryDark, fontWeight: "700" }}>{item.titulo}</Text>
          <Text numberOfLines={1} style={{ color: cores.textMuted, fontSize: 12 }}>{item.bairro} · {item.categoria}</Text>
        </View>
      </Marker>)}
      {foco && !focoJaEstaNaLista ? <Marker
        id={foco.id ?? "ocorrencia-em-foco"}
        lngLat={[foco.longitude, foco.latitude]}
        onPress={() => { if (foco.id) router.push({ pathname: "/ocorrencias/[id]", params: { id: foco.id } }); }}
      >
        <View style={{ maxWidth: 240, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: cores.primary, backgroundColor: cores.surface }}>
          <Text numberOfLines={1} style={{ color: cores.primaryDark, fontWeight: "700" }}>{foco.titulo ?? "Ocorrência selecionada"}</Text>
          {foco.bairro ? <Text numberOfLines={1} style={{ color: cores.textMuted, fontSize: 12 }}>{foco.bairro}</Text> : null}
        </View>
      </Marker> : null}
      {localizacaoAtual ? <Marker id="localizacao-atual" lngLat={[localizacaoAtual.longitude, localizacaoAtual.latitude]}>
        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 4, borderColor: cores.surface, backgroundColor: "#2F80ED" }} />
      </Marker> : null}
    </Map>

    <View pointerEvents="box-none" style={styles.controles}>
      <Pressable accessibilityRole="button" accessibilityLabel="Centralizar na minha localização atual" onPress={() => void centralizarNaMinhaLocalizacao()} disabled={buscandoLocalizacao} style={[styles.controle, buscandoLocalizacao && { opacity: 0.55 }]}>
        <Text style={styles.controleTexto}>◎</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Aproximar mapa" onPress={() => ajustarZoom(1)} style={styles.controle}><Text style={styles.controleTexto}>+</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Afastar mapa" onPress={() => ajustarZoom(-1)} style={styles.controle}><Text style={styles.controleTexto}>−</Text></Pressable>
    </View>

    {mensagemLocalizacao ? <View style={styles.aviso}>
      {buscandoLocalizacao ? <ActivityIndicator size="small" color={cores.primary} /> : null}
      <Text style={styles.avisoTexto}>{mensagemLocalizacao}</Text>
    </View> : null}
    {localizadas.length === 0 ? <View style={{ position: "absolute", top: 76, left: 16, right: 78, padding: 14, borderRadius: 12, backgroundColor: cores.surface }}><Text style={{ color: cores.primaryDark }}>Ainda não há ocorrências com localização marcada.</Text></View> : null}
  </View>;
}
