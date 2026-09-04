import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../src/components/ui/Screen";
import { TextField } from "../../src/components/ui/TextField";
import { Button } from "../../src/components/ui/Button";
import { useToast } from "../../src/components/Toast";
import * as authApi from "../../src/api/auth";
import { ApiError } from "../../src/api/client";
import { useColors } from "../../src/theme/colors";

export default function ActivateScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ token?: string }>();
  const toast = useToast();
  const [token, setToken] = useState(params.token ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const activate = async () => {
    if (!token.trim()) {
      toast.show("Paste your activation token first", "error");
      return;
    }
    setLoading(true);
    try {
      await authApi.activateAccount(token.trim());
      setDone(true);
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Screen center>
        <View className="items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-accentSoft">
            <Ionicons name="checkmark-circle-outline" size={30} color={colors.success} />
          </View>
          <Text className="text-center text-2xl font-bold text-ink">Account activated</Text>
          <Text className="mt-2 text-center text-base text-subtle">
            You're all set. Sign in to start filling your vault.
          </Text>
          <View className="mt-8 w-full">
            <Button title="Go to sign in" onPress={() => router.replace("/(auth)")} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll center>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        className="absolute left-5 top-4 h-10 w-10 items-center justify-center"
      >
        <Ionicons name="arrow-back" size={22} color={colors.ink} />
      </Pressable>

      <View className="mb-8">
        <Text className="text-3xl font-bold text-ink">Activate account</Text>
        <Text className="mt-2 text-base text-subtle">
          Paste the activation token from the email we sent you.
        </Text>
      </View>

      <TextField
        label="Activation token"
        placeholder="Paste token here"
        autoCapitalize="none"
        autoCorrect={false}
        value={token}
        onChangeText={setToken}
      />

      <View className="mt-8">
        <Button title="Activate" onPress={activate} loading={loading} />
      </View>
    </Screen>
  );
}
