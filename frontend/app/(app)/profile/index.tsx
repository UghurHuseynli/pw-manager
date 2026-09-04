import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../../src/components/ui/Screen";
import { TextField } from "../../../src/components/ui/TextField";
import { Button } from "../../../src/components/ui/Button";
import { Avatar } from "../../../src/components/ui/Avatar";
import { useToast } from "../../../src/components/Toast";
import { useAuthStore } from "../../../src/store/auth-store";
import { useDeleteAccount, useUpdateProfile } from "../../../src/hooks/useUser";
import { ApiError } from "../../../src/api/client";
import { useColors } from "../../../src/theme/colors";
import { useThemeStore, type ThemePreference } from "../../../src/store/theme-store";
import { profileSchema, type ProfileInput } from "../../../src/utils/validation";

const nextPreference: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const appearanceIcon: Record<ThemePreference, keyof typeof Ionicons.glyphMap> = {
  system: "contrast-outline",
  light: "sunny-outline",
  dark: "moon-outline",
};

const appearanceLabel: Record<ThemePreference, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

function SettingsRow({
  icon,
  label,
  subtitle,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-xl2 border border-line bg-card p-4 active:opacity-80"
    >
      <View
        className={`mr-3 h-10 w-10 items-center justify-center rounded-xl2 ${
          danger ? "bg-danger/15" : "bg-accentSoft"
        }`}
      >
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.accent} />
      </View>
      <View className="flex-1">
        <Text className={`text-base font-semibold ${danger ? "text-danger" : "text-ink"}`}>
          {label}
        </Text>
        {subtitle ? <Text className="mt-0.5 text-xs text-subtle">{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: user?.username ?? "", email: user?.email ?? "" },
  });

  const onSave = async (values: ProfileInput) => {
    try {
      await updateProfile.mutateAsync(values);
      toast.show("Profile updated", "success");
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
    }
  };

  const onDeleteAccount = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      deleteTimer.current = setTimeout(() => setConfirmingDelete(false), 4000);
      return;
    }
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    deleteAccount.mutate(undefined, {
      onSuccess: () => logout(),
      onError: (e) => {
        toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
      },
    });
  };

  if (!user) return null;

  return (
    <Screen scroll>
      <View className="items-center pb-6 pt-6">
        <Avatar name={user.username} size={72} />
        <Text className="mt-3 text-xl font-bold text-ink">{user.username}</Text>
        <Text className="text-sm text-subtle">{user.email}</Text>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="username"
          render={({ field }) => (
            <TextField
              label="Username"
              autoCapitalize="none"
              error={errors.username?.message}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email?.message}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        {isDirty ? (
          <Button title="Save changes" onPress={handleSubmit(onSave)} loading={isSubmitting} />
        ) : null}
      </View>

      <View className="mt-8 gap-3">
        <SettingsRow
          icon={appearanceIcon[themePreference]}
          label="Appearance"
          subtitle={appearanceLabel[themePreference]}
          onPress={() => setThemePreference(nextPreference[themePreference])}
        />
        <SettingsRow
          icon="key-outline"
          label="Change password"
          onPress={() => router.push("/(app)/profile/change-password")}
        />
        <SettingsRow
          icon="shield-checkmark-outline"
          label="Two-factor authentication"
          subtitle={user.is_otp ? "Enabled" : "Disabled"}
          onPress={() => router.push("/(app)/profile/security")}
        />
        <SettingsRow icon="log-out-outline" label="Log out" onPress={logout} />
      </View>

      <View className="mb-8 mt-8">
        <Button
          title={confirmingDelete ? "Tap again to confirm deletion" : "Delete account"}
          variant="danger"
          onPress={onDeleteAccount}
          loading={deleteAccount.isPending}
        />
      </View>
    </Screen>
  );
}
