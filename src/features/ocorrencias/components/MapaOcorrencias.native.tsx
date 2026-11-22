import { router } from "expo-router";
import MapView, { Callout, Marker } from "react-native-maps";
import { Text, View } from "react-native";
import type { Ocorrencia } from "../types/Ocorrencia";
import { cores } from "@/configs/tema";

export default function MapaOcorrencias({ ocorrencias }: { ocorrencias: Ocorrencia[] }) {
  const latitudes = ocorrencias.map(({ latitude }) => latitude!);
  const longitudes = ocorrencias.map(({ longitude }) => longitude!);
  const centro = ocorrencias.length ? {
    latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    latitudeDelta: Math.max(0.04, (Math.max(...latitudes) - Math.min(...latitudes)) * 1.5),
    longitudeDelta: Math.max(0.04, (Math.max(...longitudes) - Math.min(...longitudes)) * 1.5),
  } : { latitude: -27.59, longitude: -48.51, latitudeDelta: 0.08, longitudeDelta: 0.08 };
  return <View style={{ flex: 1, backgroundColor: cores.background }}>
    <MapView style={{ flex: 1 }} initialRegion={centro}>
      {ocorrencias.map((item) => <Marker key={item.id} coordinate={{ latitude: item.latitude!, longitude: item.longitude! }} title={item.titulo} description={item.bairro} onPress={() => router.push({ pathname: "/ocorrencias/[id]", params: { id: item.id } })} onCalloutPress={() => router.push({ pathname: "/ocorrencias/[id]", params: { id: item.id } })}>
        <Callout><View style={{ maxWidth: 220, gap: 4 }}><Text style={{ fontWeight: "700", color: cores.primaryDark }}>{item.titulo}</Text><Text style={{ color: cores.textMuted }}>{item.bairro} · {item.categoria}</Text><Text style={{ color: cores.primary }}>Toque para ver detalhes</Text></View></Callout>
      </Marker>)}
    </MapView>
    {ocorrencias.length === 0 ? <View style={{ position: "absolute", top: 16, left: 16, right: 16, padding: 14, borderRadius: 12, backgroundColor: cores.surface }}><Text style={{ color: cores.primaryDark }}>Ainda não há ocorrências com localização marcada.</Text></View> : null}
  </View>;
}
