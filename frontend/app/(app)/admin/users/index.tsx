import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../../../src/components/ui/Screen";
import { TextField } from "../../../../src/components/ui/TextField";
import { EmptyState } from "../../../../src/components/ui/EmptyState";
import { Badge } from "../../../../src/components/ui/Badge";
import { Avatar } from "../../../../src/components/ui/Avatar";
import { useAdminUsers } from "../../../../src/hooks/useAdmin";
import { useColors } from "../../../../src/theme/colors";
import type { UserPublic } from "../../../../src/api/types";

function UserRow({ user, onPress }: { user: UserPublic; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-xl2 border border-line bg-card p-4 active:opacity-80"
    >
      <Avatar name={user.username} size={40} />
      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {user.username}
        </Text>
        <Text className="text-xs text-subtle" numberOfLines={1}>
          {user.email}
        </Text>
      </View>
      <View className="mr-2 items-end gap-1">
        {user.is_superuser ? <Badge label="Admin" variant="accent" /> : null}
        <Badge
          label={user.is_active ? "Active" : "Inactive"}
          variant={user.is_active ? "success" : "neutral"}
        />
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
    </Pressable>
  );
}

export default function AdminUsersScreen() {
  const colors = useColors();
  const [query, setQuery] = useState("");
  const { data, isLoading } = useAdminUsers();

  const filtered = useMemo(() => {
    const items = data?.data ?? [];
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter(
      (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <Screen>
      <View className="flex-row items-center justify-between pb-2 pt-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text className="text-xl font-bold text-ink">Users</Text>
        <Pressable
          onPress={() => router.push("/(app)/admin/users/new")}
          className="h-11 w-11 items-center justify-center rounded-full bg-accent active:opacity-80"
        >
          <Ionicons name="add" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <View className="pb-4">
        <TextField
          placeholder="Search by username or email..."
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          rightElement={<Ionicons name="search" size={18} color={colors.subtle} />}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={query ? "search-outline" : "people-outline"}
          title={query ? "No matches" : "No users yet"}
          subtitle={query ? "Try a different search." : "Create the first account."}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserRow user={item} onPress={() => router.push(`/(app)/admin/users/${item.id}`)} />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </Screen>
  );
}
