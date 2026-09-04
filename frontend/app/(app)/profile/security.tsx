import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../../src/components/ui/Screen";
import { Button } from "../../../src/components/ui/Button";
import { QrCodeImage } from "../../../src/components/QrCodeImage";
import { useToast } from "../../../src/components/Toast";
import { useAuthStore } from "../../../src/store/auth-store";
import { useDisable2fa } from "../../../src/hooks/useUser";
import { ApiError } from "../../../src/api/client";
import { useColors } from "../../../src/theme/colors";

export default function SecurityScreen() {
  const colors = useColors();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const disable2fa = useDisable2fa();
  const [settingUp, setSettingUp] = useState(false);

  const onDisable = async () => {
    try {
      await disable2fa.mutateAsync();
      toast.show("Two-factor authentication disabled", "success");
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
    }
  };

  return (
    <Screen scroll>
      <View className="flex-row items-center pb-4 pt-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="mr-2 h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text className="text-2xl font-bold text-ink">Two-factor authentication</Text>
      </View>

      {user?.is_otp ? (
        <View className="items-center rounded-xl2 border border-line bg-card p-6">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-accentSoft">
            <Ionicons name="shield-checkmark" size={26} color={colors.success} />
          </View>
          <Text className="text-center text-base font-semibold text-ink">
            2FA is protecting your account
          </Text>
          <Text className="mt-1.5 text-center text-sm text-subtle">
            You'll need a code from your authenticator app every time you sign in.
          </Text>
          <View className="mt-6 w-full">
            <Button title="Disable 2FA" variant="danger" onPress={onDisable} loading={disable2fa.isPending} />
          </View>
        </View>
      ) : settingUp && token ? (
        <View className="items-center">
          <Text className="mb-5 text-center text-sm text-subtle">
            Scan this code with Google Authenticator, Authy, or any TOTP app.
          </Text>
          <QrCodeImage token={token} onLoaded={refreshUser} />
          <View className="mt-8 w-full">
            <Button title="Done" onPress={() => router.back()} />
          </View>
        </View>
      ) : (
        <View className="items-center rounded-xl2 border border-line bg-card p-6">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-accentSoft">
            <Ionicons name="shield-outline" size={26} color={colors.accent} />
          </View>
          <Text className="text-center text-base font-semibold text-ink">
            Add an extra layer of security
          </Text>
          <Text className="mt-1.5 text-center text-sm text-subtle">
            Protect your vault with a time-based code from an authenticator app.
          </Text>
          <View className="mt-6 w-full">
            <Button title="Enable 2FA" onPress={() => setSettingUp(true)} />
          </View>
        </View>
      )}
    </Screen>
  );
}
