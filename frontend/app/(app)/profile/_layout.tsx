import { Stack } from "expo-router";
import { useColors } from "../../../src/theme/colors";

export default function ProfileLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.app },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="security" />
    </Stack>
  );
}
