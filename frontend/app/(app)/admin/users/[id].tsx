import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../../../src/components/ui/Screen";
import { TextField } from "../../../../src/components/ui/TextField";
import { PasswordField } from "../../../../src/components/ui/PasswordField";
import { Button } from "../../../../src/components/ui/Button";
import { Toggle } from "../../../../src/components/ui/Toggle";
import { Avatar } from "../../../../src/components/ui/Avatar";
import { QrCodeImage } from "../../../../src/components/QrCodeImage";
import { useToast } from "../../../../src/components/Toast";
import { useAuthStore } from "../../../../src/store/auth-store";
import * as adminApi from "../../../../src/api/admin";
import {
  useAdminUser,
  useChangeUserPassword,
  useDeleteAdminUser,
  useDisable2faForUser,
  useUpdateAdminUser,
} from "../../../../src/hooks/useAdmin";
import { ApiError } from "../../../../src/api/client";
import { useColors } from "../../../../src/theme/colors";
import {
  adminEditUserSchema,
  adminForcePasswordSchema,
  type AdminEditUserInput,
  type AdminForcePasswordInput,
} from "../../../../src/utils/validation";

function formatDate(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export default function AdminUserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const toast = useToast();
  const currentUser = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const { data: user, isLoading } = useAdminUser(id);
  const updateUser = useUpdateAdminUser(id);
  const deleteUser = useDeleteAdminUser();
  const changePassword = useChangeUserPassword(id);
  const disable2fa = useDisable2faForUser(id);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [settingUp2fa, setSettingUp2fa] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const isSelf = currentUser?.id === id;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AdminEditUserInput>({
    resolver: zodResolver(adminEditUserSchema),
    defaultValues: { username: "", email: "", isActive: true, isSuperuser: false },
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        isActive: user.is_active,
        isSuperuser: user.is_superuser,
      });
    }
  }, [user, reset]);

  const {
    control: pwControl,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    formState: { errors: pwErrors, isSubmitting: pwSubmitting },
  } = useForm<AdminForcePasswordInput>({
    resolver: zodResolver(adminForcePasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSave = async (values: AdminEditUserInput) => {
    try {
      await updateUser.mutateAsync({
        username: values.username,
        email: values.email,
        is_active: values.isActive,
        is_superuser: values.isSuperuser,
      });
      toast.show("User updated", "success");
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
    }
  };

  const onForcePassword = async (values: AdminForcePasswordInput) => {
    try {
      await changePassword.mutateAsync(values.newPassword);
      toast.show("Password changed", "success");
      resetPw();
      setResettingPassword(false);
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
    }
  };

  const onDisable2fa = async () => {
    try {
      await disable2fa.mutateAsync();
      toast.show("Two-factor authentication disabled", "success");
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
    }
  };

  const onDelete = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      deleteTimer.current = setTimeout(() => setConfirmingDelete(false), 4000);
      return;
    }
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    deleteUser.mutate(id, {
      onSuccess: () => {
        toast.show("User deleted", "success");
        router.back();
      },
      onError: (e) => {
        toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
      },
    });
  };

  if (isLoading || !user || !token) {
    return (
      <Screen center>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    );
  }

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
        <Avatar name={user.username} size={40} />
        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-ink" numberOfLines={1}>
            {user.username}
          </Text>
          <Text className="text-xs text-subtle">Joined {formatDate(user.created_at)}</Text>
        </View>
      </View>

      <View className="mb-6 rounded-xl2 border border-line bg-card p-4">
        <Text className="text-xs font-medium uppercase tracking-wide text-subtle">
          Last sign-in
        </Text>
        <Text className="mt-1 text-base text-ink">{formatDate(user.last_login)}</Text>
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
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Toggle label="Active" value={field.value} onValueChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="isSuperuser"
          render={({ field }) => (
            <Toggle
              label="Admin"
              description={isSelf ? "You can't remove your own admin access here." : undefined}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        {isDirty ? (
          <Button title="Save changes" onPress={handleSubmit(onSave)} loading={isSubmitting} />
        ) : null}
      </View>

      <Pressable
        onPress={() => router.push(`/(app)/admin/credentials?userId=${id}&username=${encodeURIComponent(user.username)}`)}
        className="mt-6 flex-row items-center justify-between rounded-xl2 border border-line bg-card p-4 active:opacity-80"
      >
        <Text className="text-base font-semibold text-ink">View this user's credentials</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
      </Pressable>

      <View className="mt-6">
        <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle">
          Two-factor authentication
        </Text>
        {user.is_otp ? (
          <View className="rounded-xl2 border border-line bg-card p-4">
            <Text className="text-sm text-ink">2FA is enabled for this account.</Text>
            <View className="mt-3">
              <Button
                title="Disable 2FA"
                variant="danger"
                onPress={onDisable2fa}
                loading={disable2fa.isPending}
              />
            </View>
          </View>
        ) : settingUp2fa ? (
          <View className="items-center rounded-xl2 border border-line bg-card p-4">
            <QrCodeImage token={token} path={adminApi.enable2faForUserPath(id)} />
            <View className="mt-4 w-full">
              <Button title="Done" onPress={() => setSettingUp2fa(false)} />
            </View>
          </View>
        ) : (
          <View className="rounded-xl2 border border-line bg-card p-4">
            <Text className="text-sm text-ink">2FA is not enabled for this account.</Text>
            <View className="mt-3">
              <Button title="Enable 2FA" onPress={() => setSettingUp2fa(true)} />
            </View>
          </View>
        )}
      </View>

      {!isSelf ? (
        <View className="mt-6">
          <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle">
            Force password reset
          </Text>
          {resettingPassword ? (
            <View className="gap-4 rounded-xl2 border border-line bg-card p-4">
              <Controller
                control={pwControl}
                name="newPassword"
                render={({ field }) => (
                  <PasswordField
                    label="New password"
                    showStrength
                    error={pwErrors.newPassword?.message}
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              <Controller
                control={pwControl}
                name="confirmPassword"
                render={({ field }) => (
                  <PasswordField
                    label="Confirm new password"
                    error={pwErrors.confirmPassword?.message}
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              <Button
                title="Set new password"
                onPress={handlePwSubmit(onForcePassword)}
                loading={pwSubmitting}
              />
            </View>
          ) : (
            <Button
              title="Set a new password for this user"
              variant="secondary"
              onPress={() => setResettingPassword(true)}
            />
          )}
        </View>
      ) : null}

      {!user.is_superuser && !isSelf ? (
        <View className="mb-8 mt-8">
          <Button
            title={confirmingDelete ? "Tap again to confirm deletion" : "Delete user"}
            variant="danger"
            onPress={onDelete}
            loading={deleteUser.isPending}
          />
        </View>
      ) : null}
    </Screen>
  );
}
