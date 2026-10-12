import { router } from "expo-router";
import { StyleSheet, Text, Pressable, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  label: string;
  href: "/" | "/occurrences/index" | "/create";
  secondary?: boolean;
  light?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ActionButton({ label, href, secondary = false, light = false, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        light && styles.lightButton,
        light && secondary && styles.lightSecondary,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, secondary && styles.secondaryLabel, light && styles.lightLabel, light && secondary && styles.lightSecondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    borderRadius: 16,
    backgroundColor: "#176B4D",
  },
  secondary: { borderWidth: 1, borderColor: "#B8CCBF", backgroundColor: "#FFFFFF" },
  lightButton: { backgroundColor: "#FFFFFF" },
  lightSecondary: { borderColor: "#A4C3B0", backgroundColor: "transparent" },
  pressed: { opacity: 0.78 },
  label: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  secondaryLabel: { color: "#176B4D" },
  lightLabel: { color: "#14583F" },
  lightSecondaryLabel: { color: "#FFFFFF" },
});
