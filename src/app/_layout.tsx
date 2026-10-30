import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { cores } from "@/configs/tema";
import { CarregamentoGlobalProvider } from "@/shared/components/ui/CarregamentoGlobal";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CarregamentoGlobalProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: cores.background },
            headerTintColor: cores.primaryDark,
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: cores.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="inicio" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="ocorrencias" options={{ headerShown: false }} />
        </Stack>
      </CarregamentoGlobalProvider>
    </SafeAreaProvider>
  );
}
