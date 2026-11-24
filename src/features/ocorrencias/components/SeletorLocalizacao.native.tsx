import { useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { Camera, Map, Marker, type CameraRef, type MapRef } from "@maplibre/maplibre-react-native";
import { cores } from "@/configs/tema";
import { estiloMapaUrl } from "@/configs/mapa";
import { capturarLocalizacaoAtual } from "@/shared/services/localizacaoDispositivo";

type Coordenadas = { latitude: number; longitude: number };
type Props = {
  latitude: number | null;
  longitude: number | null;
  onChange: (value: Coordenadas | null) => void;
  disabled?: boolean;
  status?: string;
  bairro?: string;
  cidade?: string;
};
const centroInicial: [number, number] = [-48.917, -27.096];
const styles = {
  resumo: { color: cores.textMuted, fontSize: 12, lineHeight: 18 } as const,
  botao: { minHeight: 46, justifyContent: "center", alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: cores.primary, backgroundColor: cores.surface, paddingHorizontal: 14 } as const,
  botaoTexto: { color: cores.primary, fontSize: 14, fontWeight: "700" as const },
  modal: { flex: 1, backgroundColor: cores.background, padding: 16, gap: 12 } as const,
  titulo: { color: cores.primaryDark, fontSize: 20, fontWeight: "800" as const },
  mapaContainer: { flex: 1, minHeight: 280, borderRadius: 16, overflow: "hidden" as const },
  mapa: { flex: 1 },
  controlesMapa: { position: "absolute" as const, top: 12, right: 12, gap: 8 },
  controleMapa: { width: 48, height: 48, alignItems: "center" as const, justifyContent: "center" as const, borderRadius: 24, backgroundColor: cores.surface, borderWidth: 1, borderColor: cores.border, elevation: 3 },
  controleTexto: { color: cores.primaryDark, fontSize: 22, fontWeight: "700" as const },
  statusMapa: { position: "absolute" as const, top: 12, left: 12, right: 72, flexDirection: "row" as const, alignItems: "center" as const, gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: cores.surface, elevation: 2 },
  statusMapaTexto: { flex: 1, color: cores.primaryDark, fontSize: 12, lineHeight: 16 } as const,
  localizacaoSelecionada: { gap: 4, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: cores.border, backgroundColor: cores.surface } as const,
  localizacaoRotulo: { color: cores.primaryDark, fontSize: 13, fontWeight: "700" as const },
  localizacaoTexto: { color: cores.textMuted, fontSize: 13, lineHeight: 18 } as const,
  acoes: { flexDirection: "row" as const, gap: 10 },
  acao: { flex: 1, minHeight: 48, alignItems: "center" as const, justifyContent: "center" as const, borderRadius: 12, backgroundColor: cores.primary },
  acaoSecundaria: { backgroundColor: cores.surface, borderWidth: 1, borderColor: cores.border },
  acaoTexto: { color: cores.surface, fontWeight: "700" as const },
  acaoTextoSecundaria: { color: cores.primaryDark },
};

function obterNomeDaRua(propriedades: Record<string, unknown> | null): string | null {
  if (!propriedades) return null;
  const classesDeVia = new Set([
    "motorway", "trunk", "primary", "secondary", "tertiary", "minor", "service",
    "residential", "track", "path", "street", "street_limited", "living_street",
    "pedestrian", "unclassified", "road",
  ]);
  const classe = propriedades.class ?? propriedades.subclass;
  if (typeof classe !== "string" || !classesDeVia.has(classe)) return null;
  const nome = propriedades["name:pt"] ?? propriedades.name ?? propriedades["name:latin"] ?? propriedades.name_en;
  return typeof nome === "string" && nome.trim() ? nome.trim() : null;
}

export function SeletorLocalizacao({ latitude, longitude, onChange, disabled, status, bairro, cidade }: Props) {
  const [aberto, definirAberto] = useState(false);
  const [ponto, definirPonto] = useState<Coordenadas | null>(null);
  const [localizacaoAtual, definirLocalizacaoAtual] = useState<Coordenadas | null>(null);
  const [zoomAtual, definirZoomAtual] = useState(13);
  const [buscandoLocalizacao, definirBuscandoLocalizacao] = useState(false);
  const [mensagemMapa, definirMensagemMapa] = useState("");
  const [resultadoEndereco, definirResultadoEndereco] = useState<{ chave: string; endereco: string | null } | null>(null);
  const mapaRef = useRef<MapRef | null>(null);
  const cameraRef = useRef<CameraRef | null>(null);
  const mapaPronto = useRef(false);
  const centroPendente = useRef<[number, number] | null>(null);
  const enderecoPendente = useRef<Coordenadas | null>(null);
  const selecionado = latitude !== null && longitude !== null ? { latitude, longitude } : null;
  const centro: [number, number] = selecionado ? [selecionado.longitude, selecionado.latitude] : centroInicial;
  const chaveEndereco = selecionado ? selecionado.latitude + "," + selecionado.longitude : null;
  const enderecoAtual = resultadoEndereco?.chave === chaveEndereco ? resultadoEndereco.endereco : null;
  const carregandoEndereco = Boolean(chaveEndereco && resultadoEndereco?.chave !== chaveEndereco);

  async function consultarEnderecoNoMapa(coordenadas: Coordenadas, pontoNaTela?: [number, number]) {
    if (!mapaRef.current || !mapaPronto.current) return;
    const chave = coordenadas.latitude + "," + coordenadas.longitude;
    try {
      const ponto = pontoNaTela ?? await mapaRef.current.project([coordenadas.longitude, coordenadas.latitude]);
      const margem = 14;
      const feicoes = await mapaRef.current.queryRenderedFeatures(
        [[ponto[0] - margem, ponto[1] - margem], [ponto[0] + margem, ponto[1] + margem]],
      );
      const nomes = feicoes
        .map((feicao) => obterNomeDaRua(feicao.properties as Record<string, unknown> | null))
        .filter((nome): nome is string => Boolean(nome));
      definirResultadoEndereco({ chave, endereco: nomes[0] ?? null });
    } catch {
      definirResultadoEndereco({ chave, endereco: null });
    }
  }

  function regiaoAlterada(zoom: number) {
    definirZoomAtual(zoom);
    if (enderecoPendente.current) {
      const coordenadas = enderecoPendente.current;
      enderecoPendente.current = null;
      void consultarEnderecoNoMapa(coordenadas);
    }
  }

  function centralizarNaCoordenada(coordenadas: Coordenadas, zoom = 16) {
    const centroCoordenada: [number, number] = [coordenadas.longitude, coordenadas.latitude];
    definirZoomAtual(zoom);
    if (!mapaPronto.current || !cameraRef.current) {
      centroPendente.current = centroCoordenada;
      return;
    }
    cameraRef.current.flyTo({ center: centroCoordenada, zoom, duration: 650 });
  }

  function mapaCarregado() {
    mapaPronto.current = true;
    const aguardandoCentralizacao = Boolean(centroPendente.current);
    if (centroPendente.current) {
      cameraRef.current?.flyTo({ center: centroPendente.current, zoom: 16, duration: 650 });
      centroPendente.current = null;
    }
    if (enderecoPendente.current && !aguardandoCentralizacao) {
      const coordenadas = enderecoPendente.current;
      enderecoPendente.current = null;
      void consultarEnderecoNoMapa(coordenadas);
    }
  }

  async function buscarLocalizacaoAtual(centralizar: boolean) {
    definirBuscandoLocalizacao(true);
    definirMensagemMapa("Buscando a localização atual do aparelho…");
    try {
      const atual = await capturarLocalizacaoAtual();
      definirLocalizacaoAtual(atual);
      if (centralizar) {
        definirPonto(atual);
        enderecoPendente.current = atual;
      }
      definirMensagemMapa(centralizar
        ? "Sua posição atual foi marcada como local do problema. Toque no mapa para ajustar."
        : "Ponto azul: sua posição atual. Toque no mapa para marcar o problema.");
      if (centralizar) centralizarNaCoordenada(atual);
    } catch {
      definirMensagemMapa("Não foi possível obter sua localização. Confira a permissão e mova o mapa manualmente.");
    } finally {
      definirBuscandoLocalizacao(false);
    }
  }

  function abrir() {
    definirPonto(selecionado);
    definirZoomAtual(selecionado ? 14 : 13);
    definirMensagemMapa("");
    mapaPronto.current = false;
    centroPendente.current = null;
    enderecoPendente.current = selecionado;
    definirAberto(true);
    void buscarLocalizacaoAtual(!selecionado);
  }

  function fechar() {
    definirAberto(false);
    mapaPronto.current = false;
    centroPendente.current = null;
  }

  function selecionar(evento: { nativeEvent: { lngLat: [number, number]; point: [number, number] } }) {
    const [longitudeSelecionada, latitudeSelecionada] = evento.nativeEvent.lngLat;
    const coordenadas = { latitude: latitudeSelecionada, longitude: longitudeSelecionada };
    definirPonto(coordenadas);
    void consultarEnderecoNoMapa(coordenadas, evento.nativeEvent.point);
  }

  async function confirmarLocal() {
    if (!ponto) return;
    void consultarEnderecoNoMapa(ponto);
    onChange(ponto);
    fechar();
  }

  function ajustarZoom(incremento: number) {
    const novoZoom = Math.max(3, Math.min(20, zoomAtual + incremento));
    definirZoomAtual(novoZoom);
    cameraRef.current?.zoomTo(novoZoom, { duration: 200 });
  }

  return <View style={{ gap: 8 }}>
    <Text style={styles.resumo}>{status ?? (selecionado ? "Local do problema capturado. Você pode ajustar o ponto no mapa." : "Capturando o local do problema…")}</Text>
    <View accessibilityLabel="Localização selecionada" style={styles.localizacaoSelecionada}>
      <Text style={styles.localizacaoRotulo}>Local que será usado</Text>
      <Text style={styles.localizacaoTexto}>
        {selecionado
          ? carregandoEndereco
            ? "Identificando o endereço do ponto…"
            : enderecoAtual ?? (resultadoEndereco?.chave === chaveEndereco
              ? "Rua não identificada no mapa. Confira o ponto marcado."
              : "Identificando a rua pelo mapa…")
          : "Ainda não definido. Marque o ponto no mapa para continuar."}
      </Text>
      {bairro || cidade ? <Text style={styles.resumo}>Área do registro: {[bairro, cidade].filter(Boolean).join(" · ")}</Text> : null}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Ajustar localização no mapa" onPress={abrir} disabled={disabled} style={[styles.botao, disabled && { opacity: 0.5 }]}><Text style={styles.botaoTexto}>{selecionado ? "Ajustar localização no mapa" : "Marcar o local no mapa"}</Text></Pressable>
    {selecionado ? <Pressable accessibilityRole="button" onPress={() => onChange(null)} disabled={disabled}><Text style={styles.resumo}>Remover localização</Text></Pressable> : null}
    <Modal visible={aberto} animationType="slide" onRequestClose={fechar}>
      <View style={styles.modal}>
        <Text style={styles.titulo}>Marque o local do problema</Text>
        <Text style={styles.resumo}>Arraste e amplie o mapa. Toque no ponto exato para posicionar o marcador.</Text>
        <View style={styles.mapaContainer}>
          <Map
            ref={mapaRef}
            testID="mapa-seletor-localizacao"
            style={styles.mapa}
            mapStyle={estiloMapaUrl}
            attribution
            logo
            compass
            compassPosition={{ top: 14, left: 14 }}
            androidView="texture"
            onDidFinishLoadingMap={mapaCarregado}
            onPress={selecionar}
            onRegionDidChange={(evento) => regiaoAlterada(evento.nativeEvent.zoom)}
          >
            <Camera ref={cameraRef} initialViewState={{ center: centro, zoom: selecionado ? 14 : 13 }} minZoom={3} maxZoom={20} />
            {localizacaoAtual ? <Marker id="localizacao-dispositivo" lngLat={[localizacaoAtual.longitude, localizacaoAtual.latitude]}>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 4, borderColor: cores.surface, backgroundColor: "#2F80ED" }} />
            </Marker> : null}
            {ponto ? <Marker id="local-da-ocorrencia" lngLat={[ponto.longitude, ponto.latitude]}>
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 4, borderColor: cores.surface, backgroundColor: cores.primary }} />
            </Marker> : null}
          </Map>
          <View pointerEvents="box-none" style={styles.controlesMapa}>
            <Pressable accessibilityRole="button" accessibilityLabel="Usar localização atual" onPress={() => void buscarLocalizacaoAtual(true)} disabled={buscandoLocalizacao} style={[styles.controleMapa, buscandoLocalizacao && { opacity: 0.55 }]}>
              <Text style={styles.controleTexto}>◎</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Aproximar mapa" onPress={() => ajustarZoom(1)} style={styles.controleMapa}><Text style={styles.controleTexto}>+</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Afastar mapa" onPress={() => ajustarZoom(-1)} style={styles.controleMapa}><Text style={styles.controleTexto}>−</Text></Pressable>
          </View>
          {mensagemMapa ? <View style={styles.statusMapa}>
            {buscandoLocalizacao ? <ActivityIndicator size="small" color={cores.primary} /> : null}
            <Text style={styles.statusMapaTexto}>{mensagemMapa}</Text>
          </View> : null}
        </View>
        <View style={styles.acoes}>
          <Pressable accessibilityRole="button" onPress={fechar} style={[styles.acao, styles.acaoSecundaria]}><Text style={[styles.acaoTexto, styles.acaoTextoSecundaria]}>Cancelar</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => void confirmarLocal()} disabled={!ponto} style={[styles.acao, !ponto && { opacity: 0.5 }]}><Text style={styles.acaoTexto}>Confirmar local</Text></Pressable>
        </View>
      </View>
    </Modal>
  </View>;
}

