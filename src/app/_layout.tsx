import { Stack } from "expo-router";
import { cores } from "@/configs/tema";

export default function RootLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: cores.background },
      headerTintColor: cores.primaryDark,
      headerTitleStyle: { fontWeight: "700" },
      contentStyle: { backgroundColor: cores.background },
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Acesso" }} />
      <Stack.Screen name="ocorrencias" options={{ headerShown: false }} />
    </Stack>
  );
}
