import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../theme/colors";
import type { CredentialListItem } from "../api/types";

const swatches = ["#7C6CFF", "#34D399", "#FBBF24", "#F87171", "#38BDF8", "#F472B6"];

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return swatches[hash % swatches.length];
}

export function VaultItemRow({
  item,
  onPress,
}: {
  item: CredentialListItem;
  onPress: () => void;
}) {
  const colors = useColors();
  const tint = colorFor(item.id);
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-xl2 border border-line bg-card p-4 active:opacity-80"
    >
      <View
        className="mr-3 h-11 w-11 items-center justify-center rounded-xl2"
        style={{ backgroundColor: `${tint}22` }}
      >
        <Text className="text-base font-bold" style={{ color: tint }}>
          {item.title.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {item.title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
    </Pressable>
  );
}
