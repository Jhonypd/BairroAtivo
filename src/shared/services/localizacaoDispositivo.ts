import * as Location from "expo-location";

export type CoordenadasLocalizacao = { latitude: number; longitude: number };

export async function capturarLocalizacaoAtual(): Promise<CoordenadasLocalizacao> {
  const permissao = await Location.requestForegroundPermissionsAsync();
  if (permissao.status !== "granted") throw new Error("Permissão de localização não concedida.");
  const ponto = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { latitude: ponto.coords.latitude, longitude: ponto.coords.longitude };
}
