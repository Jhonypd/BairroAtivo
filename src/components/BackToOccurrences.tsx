import { router } from "expo-router";
import { Pressable, Text } from "react-native";
import { backToOccurrencesStyles as styles } from "./BackToOccurrences.styles";

export function BackToOccurrences() {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.replace("/occurrences/index")}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>Voltar às ocorrências</Text>
    </Pressable>
  );
}
