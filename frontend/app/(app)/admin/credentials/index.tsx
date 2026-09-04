import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../../../src/components/ui/Screen";
import { TextField } from "../../../../src/components/ui/TextField";
import { EmptyState } from "../../../../src/components/ui/EmptyState";
import { VaultItemRow } from "../../../../src/components/VaultItemRow";
import { useAdminCredentials } from "../../../../src/hooks/useAdmin";
import { useColors } from "../../../../src/theme/colors";

export default function AdminCredentialsScreen() {
  const colors = useColors();
  const { userId, username } = useLocalSearchParams<{ userId?: string; username?: string }>();
  const [query, setQuery] = useState("");
  const { data, isLoading } = useAdminCredentials(userId);

  const filtered = useMemo(() => {
    const items = data?.data ?? [];
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(q));
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
        <Text className="text-xl font-bold text-ink">Credentials</Text>
        {userId ? (
          <Pressable
            onPress={() => router.push(`/(app)/admin/credentials/new?userId=${userId}&username=${username ?? ""}`)}
            className="h-11 w-11 items-center justify-center rounded-full bg-accent active:opacity-80"
          >
            <Ionicons name="add" size={24} color={colors.ink} />
          </Pressable>
        ) : (
          <View className="h-11 w-11" />
        )}
      </View>

      {userId ? (
        <Pressable
          onPress={() => router.setParams({ userId: undefined, username: undefined })}
          className="mb-4 flex-row items-center self-start rounded-full bg-accentSoft px-3 py-1.5"
        >
          <Text className="mr-1.5 text-sm font-medium text-accent">
            Filtered: {username || "this user"}
          </Text>
          <Ionicons name="close-circle" size={16} color={colors.accent} />
        </Pressable>
      ) : null}

      <View className="pb-4">
        <TextField
          placeholder="Search by title..."
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
          icon={query ? "search-outline" : "key-outline"}
          title={query ? "No matches" : "No credentials"}
          subtitle={query ? "Try a different search." : "Nothing stored yet."}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VaultItemRow
              item={item}
              onPress={() => router.push(`/(app)/admin/credentials/${item.id}`)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </Screen>
  );
}
