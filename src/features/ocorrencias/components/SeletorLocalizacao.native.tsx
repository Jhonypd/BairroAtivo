import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import MapView, { Marker, type MapPressEvent, type Region } from "react-native-maps";
import { cores } from "@/configs/tema";

type Coordenadas = { latitude: number; longitude: number };
type Props = { latitude: number | null; longitude: number | null; onChange: (value: Coordenadas | null) => void; disabled?: boolean; status?: string };
const centroInicial: Region = { latitude: -27.096, longitude: -48.917, latitudeDelta: 0.05, longitudeDelta: 0.05 };
const styles = {
  resumo: { color: cores.textMuted, fontSize: 12, lineHeight: 18 } as const,
  botao: { minHeight: 46, justifyContent: "center", alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: cores.primary, backgroundColor: cores.surface, paddingHorizontal: 14 } as const,
  botaoTexto: { color: cores.primary, fontSize: 14, fontWeight: "700" as const },
  modal: { flex: 1, backgroundColor: cores.background, padding: 16, gap: 12 } as const,
  titulo: { color: cores.primaryDark, fontSize: 20, fontWeight: "800" as const },
  mapa: { flex: 1, borderRadius: 16 },
  acoes: { flexDirection: "row" as const, gap: 10 },
  acao: { flex: 1, minHeight: 48, alignItems: "center" as const, justifyContent: "center" as const, borderRadius: 12, backgroundColor: cores.primary },
  acaoSecundaria: { backgroundColor: cores.surface, borderWidth: 1, borderColor: cores.border },
  acaoTexto: { color: cores.surface, fontWeight: "700" as const },
  acaoTextoSecundaria: { color: cores.primaryDark },
};

export function SeletorLocalizacao({ latitude, longitude, onChange, disabled, status }: Props) {
  const [aberto, definirAberto] = useState(false);
  const [ponto, definirPonto] = useState<Coordenadas | null>(null);
  const selecionado = latitude !== null && longitude !== null ? { latitude, longitude } : null;
  const regiao = selecionado ? { ...selecionado, latitudeDelta: 0.02, longitudeDelta: 0.02 } : centroInicial;
  function selecionar(evento: MapPressEvent) { definirPonto(evento.nativeEvent.coordinate); }
  function abrir() { definirPonto(selecionado); definirAberto(true); }
  return <View style={{ gap: 8 }}>
    <Text style={styles.resumo}>{status ?? (selecionado ? "Local do problema capturado. Você pode ajustar o ponto no mapa." : "Capturando o local do problema…")}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Ajustar localização no mapa" onPress={abrir} disabled={disabled} style={styles.botao}><Text style={styles.botaoTexto}>{selecionado ? "Ajustar localização no mapa" : "Marcar o local no mapa"}</Text></Pressable>
    {selecionado ? <Pressable accessibilityRole="button" onPress={() => onChange(null)} disabled={disabled}><Text style={styles.resumo}>Remover localização</Text></Pressable> : null}
    <Modal visible={aberto} animationType="slide" onRequestClose={() => definirAberto(false)}>
      <View style={styles.modal}>
        <Text style={styles.titulo}>Marque o local do problema</Text>
        <Text style={styles.resumo}>Toque no mapa para posicionar o marcador. Nenhum número de coordenada precisa ser informado.</Text>
        <MapView testID="mapa-seletor-localizacao" style={styles.mapa} initialRegion={regiao} onPress={selecionar}>
          {ponto ? <Marker coordinate={ponto} title="Local da ocorrência" /> : null}
        </MapView>
        <View style={styles.acoes}>
          <Pressable accessibilityRole="button" onPress={() => definirAberto(false)} style={[styles.acao, styles.acaoSecundaria]}><Text style={[styles.acaoTexto, styles.acaoTextoSecundaria]}>Cancelar</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => { if (ponto) onChange(ponto); definirAberto(false); }} disabled={!ponto} style={[styles.acao, !ponto && { opacity: 0.5 }]}><Text style={styles.acaoTexto}>Confirmar local</Text></Pressable>
        </View>
      </View>
    </Modal>
  </View>;
}
