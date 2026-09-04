import { Redirect, Stack } from "expo-router";
import { useColors } from "../../../src/theme/colors";
import { useAuthStore } from "../../../src/store/auth-store";

export default function AdminLayout() {
  const colors = useColors();
  const isSuperuser = useAuthStore((s) => s.user?.is_superuser ?? false);

  // Tabs.Protected already hides this tab for non-superusers, but that's
  // client-side UI only — guard the actual routes too in case someone deep
  // links straight in. The real security boundary is server-side: every
  // /admin/* backend endpoint independently rejects non-superusers.
  if (!isSuperuser) {
    return <Redirect href="/(app)/vault" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.app },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="users/index" />
      <Stack.Screen name="users/[id]" />
      <Stack.Screen name="users/new" options={{ presentation: "modal" }} />
      <Stack.Screen name="credentials/index" />
      <Stack.Screen name="credentials/[id]" />
      <Stack.Screen name="credentials/new" options={{ presentation: "modal" }} />
    </Stack>
  );
}
