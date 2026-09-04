import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../../src/components/ui/Screen";
import { useColors } from "../../../src/theme/colors";
import { useAdminUsers, useAdminCredentials } from "../../../src/hooks/useAdmin";

function DashboardCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      className="mb-4 flex-row items-center rounded-xl2 border border-line bg-card p-5 active:opacity-80"
    >
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl2 bg-accentSoft">
        <Ionicons name={icon} size={22} color={colors.accent} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-ink">{title}</Text>
        <Text className="mt-0.5 text-sm text-subtle">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
    </Pressable>
  );
}

export default function AdminDashboardScreen() {
  const users = useAdminUsers();
  const credentials = useAdminCredentials();

  return (
    <Screen scroll>
      <View className="pb-6 pt-3">
        <Text className="text-3xl font-bold text-ink">Admin</Text>
        <Text className="mt-1 text-sm text-subtle">Manage users and their vaults.</Text>
      </View>

      <DashboardCard
        icon="people-outline"
        title="Users"
        subtitle={
          users.data ? `${users.data.count} account${users.data.count === 1 ? "" : "s"}` : "…"
        }
        onPress={() => router.push("/(app)/admin/users")}
      />
      <DashboardCard
        icon="key-outline"
        title="Credentials"
        subtitle={
          credentials.data
            ? `${credentials.data.count} credential${credentials.data.count === 1 ? "" : "s"} across all users`
            : "…"
        }
        onPress={() => router.push("/(app)/admin/credentials")}
      />
    </Screen>
  );
}
