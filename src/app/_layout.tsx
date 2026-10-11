import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#F7F8F4" },
        headerTintColor: "#183B2B",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#F7F8F4" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "BairroAtivo" }} />
      <Stack.Screen name="create" options={{ title: "Nova ocorrência" }} />
    </Stack>
  );
}
