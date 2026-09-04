import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../theme/colors";
import { Button } from "./Button";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = "lock-closed-outline",
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  const colors = useColors();
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-accentSoft">
        <Ionicons name={icon} size={28} color={colors.accent} />
      </View>
      <Text className="text-center text-lg font-semibold text-ink">{title}</Text>
      {subtitle ? (
        <Text className="mt-1.5 text-center text-sm text-subtle">{subtitle}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-6 w-full max-w-xs">
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
