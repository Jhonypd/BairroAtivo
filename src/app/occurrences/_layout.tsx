import { Stack } from "expo-router";
import { colors } from "../../theme/colors";

export default function OccurrencesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Ocorrências" }} />
      <Stack.Screen name="[id]" options={{ title: "Detalhes da ocorrência" }} />
    </Stack>
  );
}
