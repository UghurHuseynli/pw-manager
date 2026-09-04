import { Text, View } from "react-native";

type Variant = "neutral" | "success" | "danger" | "accent";

const bgByVariant: Record<Variant, string> = {
  neutral: "bg-cardAlt",
  success: "bg-success/15",
  danger: "bg-danger/15",
  accent: "bg-accentSoft",
};

const textByVariant: Record<Variant, string> = {
  neutral: "text-subtle",
  success: "text-success",
  danger: "text-danger",
  accent: "text-accent",
};

export function Badge({ label, variant = "neutral" }: { label: string; variant?: Variant }) {
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${bgByVariant[variant]}`}>
      <Text className={`text-xs font-semibold ${textByVariant[variant]}`}>{label}</Text>
    </View>
  );
}
