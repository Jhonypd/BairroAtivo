import { Pressable, Text } from "react-native";
import { filterChipStyles as styles } from "./FilterChip.styles";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function FilterChip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selectedChip, pressed && styles.pressed]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}
