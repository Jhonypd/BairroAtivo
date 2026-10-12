import { Stack } from "expo-router";
import { cores } from "@/configs/tema";

export default function LayoutOcorrencias() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: cores.background },
      headerTintColor: cores.primaryDark,
      headerTitleStyle: { fontWeight: "700" },
      contentStyle: { backgroundColor: cores.background },
    }}>
      <Stack.Screen name="index" options={{ title: "Ocorrências" }} />
      <Stack.Screen name="nova" options={{ title: "Nova ocorrência" }} />
      <Stack.Screen name="[id]" options={{ title: "Detalhes da ocorrência" }} />
    </Stack>
  );
}


