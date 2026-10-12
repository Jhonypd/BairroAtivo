import { Stack } from "expo-router";
import { colors } from "../theme/colors";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "BairroAtivo" }} />
      <Stack.Screen name="create" options={{ title: "Nova ocorrência" }} />
      <Stack.Screen name="occurrences" options={{ headerShown: false }} />
    </Stack>
  );
}
