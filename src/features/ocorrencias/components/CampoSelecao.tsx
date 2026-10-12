import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { campoSelecaoStyles as styles } from "./CampoSelecao.styles";

type Props = {
  label: string;
  placeholder: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
};

export function CampoSelecao({ label, placeholder, options, value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen((open) => !open)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>{value || placeholder}</Text>
        <Text style={styles.chevron} accessibilityElementsHidden>⌄</Text>
      </Pressable>
      {isOpen ? (
        <View style={styles.options}>
          {options.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: option === value }}
              onPress={() => {
                onChange(option);
                setIsOpen(false);
              }}
              style={({ pressed }) => [
                styles.option,
                option === value && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.optionText, option === value && styles.optionTextSelected]}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}







