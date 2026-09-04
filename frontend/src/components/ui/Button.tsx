import { ActivityIndicator, Pressable, Text } from "react-native";
import { useColors } from "../../theme/colors";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

const base = "flex-row items-center justify-center rounded-xl2 px-5 py-3.5 active:opacity-80";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent",
  secondary: "bg-card border border-line",
  ghost: "bg-transparent",
  danger: "bg-danger",
};

const textClasses: Record<Variant, string> = {
  primary: "text-ink font-semibold text-base",
  secondary: "text-ink font-semibold text-base",
  ghost: "text-accent font-semibold text-base",
  danger: "text-ink font-semibold text-base",
};

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = true,
}: Props) {
  const colors = useColors();
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${base} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${
        isDisabled ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? colors.accent : colors.ink} />
      ) : (
        <Text className={textClasses[variant]}>{title}</Text>
      )}
    </Pressable>
  );
}
