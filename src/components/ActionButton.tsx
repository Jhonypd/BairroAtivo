import { router, type Href } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { actionButtonStyles as styles, buttonSizeStyles } from "./ActionButton.styles";
import type { ButtonSize, ButtonVariant } from "./button.types";

type ButtonBaseProps = {
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
};

type ButtonAction =
  | { href: Href; replace?: boolean; onPress?: never }
  | { href?: never; replace?: never; onPress: () => void };

type ButtonContent =
  | {
      variant?: Exclude<ButtonVariant, "icon">;
      label: string;
      icon?: ReactNode;
      iconPosition?: "leading" | "trailing";
    }
  | {
      variant: "icon";
      icon: ReactNode;
      accessibilityLabel: string;
      label?: never;
      iconPosition?: never;
    };

type Props = ButtonBaseProps & ButtonAction & ButtonContent;

const labelVariantStyles = {
  primary: styles.label,
  secondary: styles.secondaryLabel,
  outline: styles.outlineLabel,
  ghost: styles.ghostLabel,
  destructive: styles.label,
  icon: styles.label,
} as const;

export function ActionButton(props: Props) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const sizeStyles = buttonSizeStyles[size];
  const isIconOnly = variant === "icon";
  const iconPosition = "iconPosition" in props ? props.iconPosition ?? "leading" : "leading";
  const icon = props.icon ? (
    <View style={[styles.iconSlot, sizeStyles.icon]}>{props.icon}</View>
  ) : null;

  function handlePress() {
    if (props.href !== undefined) {
      if (props.replace) {
        router.replace(props.href);
      } else {
        router.push(props.href);
      }
    } else {
      props.onPress?.();
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel}
      disabled={props.disabled}
      hitSlop={size === "xs" ? 6 : size === "sm" ? 2 : 0}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        sizeStyles.button,
        styles[variant],
        isIconOnly && sizeStyles.iconButton,
        props.fullWidth && styles.fullWidth,
        props.disabled && styles.disabled,
        pressed && styles.pressed,
        props.style,
      ]}
    >
      <View style={[styles.content, isIconOnly && styles.iconOnlyContent]}>
        {iconPosition === "leading" && icon}
        {"label" in props && props.label ? (
          <Text
            style={[
              styles.label,
              sizeStyles.label,
              labelVariantStyles[variant],
              props.disabled && styles.disabledLabel,
            ]}
          >
            {props.label}
          </Text>
        ) : null}
        {iconPosition === "trailing" && icon}
      </View>
    </Pressable>
  );
}
