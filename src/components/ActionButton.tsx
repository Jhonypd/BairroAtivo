import { router } from "expo-router";
import { Text, Pressable, type StyleProp, type ViewStyle } from "react-native";
import { actionButtonStyles as styles } from "./ActionButton.styles";

type ButtonBaseProps = {
  label: string;
  secondary?: boolean;
  style?: StyleProp<ViewStyle>;
};

type Props = ButtonBaseProps &
  (
    | {
        href: "/" | "/occurrences/index" | "/create";
        replace?: boolean;
        onPress?: never;
      }
    | { href?: never; replace?: never; onPress: () => void }
  );

export function ActionButton(props: Props) {
  const { label, secondary = false, style } = props;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        if (props.href !== undefined) {
          if (props.replace) {
            router.replace(props.href);
          } else {
            router.push(props.href);
          }
        } else {
          props.onPress?.();
        }
      }}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}
