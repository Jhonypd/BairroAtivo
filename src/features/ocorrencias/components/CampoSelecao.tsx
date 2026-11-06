import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";
import { campoSelecaoStyles as styles } from "./CampoSelecao.styles";

type Props = {
  label: string;
  placeholder: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  aberto: boolean;
  aoAlternar: () => void;
  exibirLimpar?: boolean;
};

export function CampoSelecao({ label, placeholder, options, value, onChange, aberto, aoAlternar, exibirLimpar = false }: Props) {
  const [progressoSeta] = useState(() => new Animated.Value(0));
  const rotacaoSeta = progressoSeta.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  useEffect(() => {
    Animated.timing(progressoSeta, {
      toValue: aberto ? 1 : 0,
      duration: 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [aberto, progressoSeta]);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.control}>
        <View style={styles.trigger}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${value || placeholder}`}
            accessibilityState={{ expanded: aberto }}
            onPress={aoAlternar}
            style={({ pressed }) => [styles.seletor, pressed && styles.pressed]}
          >
            <Text numberOfLines={1} style={[styles.value, !value && styles.placeholder]}>{value || placeholder}</Text>
            <Animated.View
              accessibilityElementsHidden
              style={[styles.chevron, { transform: [{ rotate: "45deg" }, { rotate: rotacaoSeta }] }]}
            />
          </Pressable>
          {exibirLimpar && value ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Limpar ${label.toLocaleLowerCase("pt-BR")}`}
              hitSlop={6}
              onPress={() => onChange("")}
              style={({ pressed }) => [styles.limpar, pressed && styles.pressed]}
            >
              <Text style={styles.iconeLimpar}>×</Text>
            </Pressable>
          ) : null}
        </View>
        {aberto ? (
          <View testID="opcoes-campo-selecao" style={styles.options}>
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.optionsConteudo}
            >
              {options.length > 0 ? options.map((option) => (
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
              )) : <Text style={styles.semOpcoes}>Nenhuma opção disponível</Text>}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </View>
  );
}







