import { Switch, Text, View } from "react-native";
import { useColors } from "../../theme/colors";

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function Toggle({ label, description, value, onValueChange }: Props) {
  const colors = useColors();
  return (
    <View className="flex-row items-center justify-between rounded-xl2 border border-line bg-card p-4">
      <View className="flex-1 pr-3">
        <Text className="text-base font-semibold text-ink">{label}</Text>
        {description ? <Text className="mt-0.5 text-xs text-subtle">{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.line, true: colors.accent }}
        thumbColor={colors.ink}
        ios_backgroundColor={colors.line}
      />
    </View>
  );
}
