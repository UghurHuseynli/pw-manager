import "../global.css";
import { useEffect } from "react";
import { View } from "react-native";
import { vars } from "nativewind";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../src/store/auth-store";
import { useThemeStore } from "../src/store/theme-store";
import { darkColors, lightColors, paletteToCssVars } from "../src/theme/colors";
import { ToastProvider } from "../src/components/Toast";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

export default function RootLayout() {
  const authHydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const hydrateAuth = useAuthStore((s) => s.hydrate);

  const themeHydrated = useThemeStore((s) => s.hydrated);
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const resolvedScheme = useThemeStore((s) => s.resolvedScheme());

  useEffect(() => {
    hydrateAuth();
    hydrateTheme();
  }, [hydrateAuth, hydrateTheme]);

  const palette = resolvedScheme === "light" ? lightColors : darkColors;

  if (!authHydrated || !themeHydrated) {
    return <View className="flex-1 bg-app" />;
  }

  return (
    <View style={[{ flex: 1 }, vars(paletteToCssVars(palette))]}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <StatusBar style={resolvedScheme === "light" ? "dark" : "light"} />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              contentStyle: { backgroundColor: palette.app },
            }}
          >
            <Stack.Protected guard={!!token}>
              <Stack.Screen name="(app)" />
            </Stack.Protected>
            <Stack.Protected guard={!token}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
          </Stack>
        </ToastProvider>
      </QueryClientProvider>
    </View>
  );
}
