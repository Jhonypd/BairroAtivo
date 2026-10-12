import { Pressable, ScrollView, Text, View } from "react-native";
import { campoSelecaoStyles as styles } from "./CampoSelecao.styles";

type Props = {
  label: string;
  placeholder: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  aberto: boolean;
  aoAlternar: () => void;
};

export function CampoSelecao({ label, placeholder, options, value, onChange, aberto, aoAlternar }: Props) {
  return (
    <View style={[styles.field, aberto && styles.fieldAberto]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        accessibilityState={{ expanded: aberto }}
        onPress={aoAlternar}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>{value || placeholder}</Text>
        <Text style={styles.chevron} accessibilityElementsHidden>⌄</Text>
      </Pressable>
      {aberto ? (
        <View style={styles.options}>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.optionsConteudo}
          >
            {options.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ selected: option === value }}
                onPress={() => {
                  onChange(option);
                  aoAlternar();
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
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}







