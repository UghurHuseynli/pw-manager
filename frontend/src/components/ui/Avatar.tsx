import { Text, View } from "react-native";

function initialsOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ name, size = 56 }: { name: string; size?: number }) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center bg-accentSoft"
    >
      <Text className="font-bold text-accent" style={{ fontSize: size * 0.36 }}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}
