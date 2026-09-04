import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../../src/components/ui/Screen";
import { TextField } from "../../../src/components/ui/TextField";
import { VaultItemRow } from "../../../src/components/VaultItemRow";
import { EmptyState } from "../../../src/components/ui/EmptyState";
import { useCredentialsList } from "../../../src/hooks/useCredentials";
import { useColors } from "../../../src/theme/colors";

export default function VaultListScreen() {
  const colors = useColors();
  const [query, setQuery] = useState("");
  const { data, isLoading, isRefetching, refetch } = useCredentialsList();

  const filtered = useMemo(() => {
    const items = data?.data ?? [];
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <Screen>
      <View className="flex-row items-center justify-between pb-2 pt-3">
        <Text className="text-3xl font-bold text-ink">Vault</Text>
        <Pressable
          onPress={() => router.push("/(app)/vault/new")}
          className="h-11 w-11 items-center justify-center rounded-full bg-accent active:opacity-80"
        >
          <Ionicons name="add" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <View className="pb-4">
        <TextField
          placeholder="Search vault..."
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
          icon={query ? "search-outline" : "lock-closed-outline"}
          title={query ? "No matches" : "Your vault is empty"}
          subtitle={
            query ? "Try a different search." : "Add your first credential to get started."
          }
          actionLabel={query ? undefined : "Add credential"}
          onAction={query ? undefined : () => router.push("/(app)/vault/new")}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VaultItemRow
              item={item}
              onPress={() => router.push(`/(app)/vault/${item.id}`)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </Screen>
  );
}
