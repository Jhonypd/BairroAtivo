import { Linking, Pressable, Text, View } from "react-native";
import { cores } from "@/configs/tema";

type Coordenadas = { latitude: number; longitude: number };
type Props = { latitude: number | null; longitude: number | null; onChange: (value: Coordenadas | null) => void; disabled?: boolean; status?: string; bairro?: string; cidade?: string };
export function SeletorLocalizacao({ latitude, longitude, onChange, disabled, status, bairro, cidade }: Props) {
  const temPonto = typeof latitude === "number" && typeof longitude === "number";
  return <View style={{ gap: 8 }}>
    <Text style={{ color: cores.textMuted, fontSize: 12, lineHeight: 18 }}>{status ?? (temPonto ? "Local do problema capturado." : "Aguardando a localização do aparelho…")}</Text>
    <View style={{ gap: 4, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: cores.border, backgroundColor: cores.surface }}><Text style={{ color: cores.primaryDark, fontWeight: "700" }}>Local que será usado</Text><Text style={{ color: cores.textMuted, fontSize: 13 }}>{temPonto ? "Ponto marcado no mapa" : "Ainda não definido. Marque o ponto no mapa para continuar."}</Text>{bairro || cidade ? <Text style={{ color: cores.textMuted, fontSize: 12 }}>Área do registro: {[bairro, cidade].filter(Boolean).join(" · ")}</Text> : null}</View>
    {temPonto ? <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`)}><Text style={{ color: cores.primary, fontWeight: "700" }}>Conferir local no OpenStreetMap</Text></Pressable> : null}

    {temPonto ? <Pressable accessibilityRole="button" onPress={() => onChange(null)} disabled={disabled}><Text style={{ color: cores.textMuted, fontSize: 12 }}>Remover localização</Text></Pressable> : null}
  </View>;
}
