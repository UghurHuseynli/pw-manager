import { Stack } from "expo-router";
import { useColors } from "../../../src/theme/colors";

export default function VaultLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.app },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="new" options={{ presentation: "modal" }} />
    </Stack>
  );
}
