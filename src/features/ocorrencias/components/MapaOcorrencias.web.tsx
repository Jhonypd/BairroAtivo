import { Linking, Pressable, ScrollView, Text } from "react-native";
import type { Ocorrencia } from "../types/Ocorrencia";
import { cores } from "@/configs/tema";
export default function MapaOcorrencias({ ocorrencias, foco }: { ocorrencias: Ocorrencia[]; foco?: { id?: string } }) {
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 12, backgroundColor: cores.background, flexGrow: 1 }}>
    <Text style={{ color: cores.primaryDark, fontSize: 22, fontWeight: "800" }}>Ocorrências com localização</Text>
    <Text style={{ color: cores.textMuted, lineHeight: 20 }}>A visualização interativa está disponível no app móvel. Na web, abra cada ponto no OpenStreetMap.</Text>
    {ocorrencias.length === 0 ? <Text style={{ color: cores.textMuted }}>Ainda não há ocorrências com localização marcada.</Text> : ocorrencias.map((item) => <Pressable key={item.id} accessibilityRole="link" onPress={() => void Linking.openURL(`https://www.openstreetmap.org/?mlat=${item.latitude}&mlon=${item.longitude}#map=17/${item.latitude}/${item.longitude}`)} style={{ padding: 14, borderRadius: 12, borderWidth: item.id === foco?.id ? 1 : 0, borderColor: cores.primary, backgroundColor: cores.surface, gap: 5 }}><Text style={{ color: cores.primaryDark, fontWeight: "700" }}>{item.titulo}</Text><Text style={{ color: cores.textMuted }}>{item.bairro} · {item.categoria}</Text><Text style={{ color: cores.primary }}>Abrir ponto no OpenStreetMap</Text></Pressable>)}
  </ScrollView>;
}
