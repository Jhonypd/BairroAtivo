import { Linking, Pressable, Text, View } from "react-native";
import { cores } from "@/configs/tema";

type Coordenadas = { latitude: number; longitude: number };
type Props = { latitude: number | null; longitude: number | null; onChange: (value: Coordenadas | null) => void; disabled?: boolean; status?: string };
export function SeletorLocalizacao({ latitude, longitude, onChange, disabled, status }: Props) {
  const temPonto = typeof latitude === "number" && typeof longitude === "number";
  return <View style={{ gap: 8 }}>
    <Text style={{ color: cores.textMuted, fontSize: 12, lineHeight: 18 }}>{status ?? (temPonto ? "Local do problema capturado." : "Aguardando a localização do aparelho…")}</Text>
    {temPonto ? <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`)}><Text style={{ color: cores.primary, fontWeight: "700" }}>Conferir local no Google Maps</Text></Pressable> : null}
    <Text style={{ color: cores.textMuted, fontSize: 12, lineHeight: 18 }}>Para ajustar o marcador, use o mapa do app móvel. No navegador, permita a localização para capturá-la automaticamente.</Text>
    {temPonto ? <Pressable accessibilityRole="button" onPress={() => onChange(null)} disabled={disabled}><Text style={{ color: cores.textMuted, fontSize: 12 }}>Remover localização</Text></Pressable> : null}
  </View>;
}
