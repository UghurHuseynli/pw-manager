import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../../src/components/ui/Screen";
import { TextField } from "../../../src/components/ui/TextField";
import { PasswordField } from "../../../src/components/ui/PasswordField";
import { Button } from "../../../src/components/ui/Button";
import { useToast } from "../../../src/components/Toast";
import {
  useCredential,
  useDeleteCredential,
  useShowPassword,
  useUpdateCredential,
} from "../../../src/hooks/useCredentials";
import { copyToClipboard } from "../../../src/utils/clipboard";
import { useColors } from "../../../src/theme/colors";
import { ApiError } from "../../../src/api/client";
import { credentialSchema, type CredentialInput } from "../../../src/utils/validation";

export default function CredentialDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const { data: credential, isLoading } = useCredential(id);
  const showPasswordMutation = useShowPassword();
  const updateMutation = useUpdateCredential(id);
  const deleteMutation = useDeleteCredential();

  const [editing, setEditing] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CredentialInput>({
    resolver: zodResolver(credentialSchema),
    defaultValues: { title: "", url: "", notes: "", username: "", password: "" },
  });

  useEffect(() => {
    if (credential && editing) {
      reset({
        title: credential.title,
        url: credential.url ?? "",
        notes: credential.notes ?? "",
        username: credential.username,
        password: revealed ?? "",
      });
    }
  }, [credential, editing, reset, revealed]);

  const ensureRevealed = async (): Promise<string | null> => {
    if (revealed) return revealed;
    try {
      const res = await showPasswordMutation.mutateAsync(id);
      setRevealed(res.password);
      return res.password;
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : "Couldn't load password", "error");
      return null;
    }
  };

  const onToggleVisible = async () => {
    if (visible) {
      setVisible(false);
      return;
    }
    const pwd = await ensureRevealed();
    if (pwd) setVisible(true);
  };

  const onCopyPassword = async () => {
    const pwd = await ensureRevealed();
    if (pwd) {
      await copyToClipboard(pwd);
      toast.show("Password copied", "success");
    }
  };

  const onCopyUsername = async () => {
    if (!credential) return;
    await copyToClipboard(credential.username);
    toast.show("Username copied", "success");
  };

  const onSave = async (values: CredentialInput) => {
    try {
      await updateMutation.mutateAsync({
        title: values.title,
        url: values.url || undefined,
        notes: values.notes || undefined,
        username: values.username,
        password: values.password,
      });
      setRevealed(values.password);
      setEditing(false);
      toast.show("Credential updated", "success");
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
    }
  };

  const onDelete = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      confirmTimer.current = setTimeout(() => setConfirmingDelete(false), 4000);
      return;
    }
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.show("Credential deleted", "success");
        router.back();
      },
      onError: (e) => {
        toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
      },
    });
  };

  if (isLoading || !credential) {
    return (
      <Screen center>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    );
  }

  const header = (
    <View className="flex-row items-center justify-between pb-4 pt-3">
      <Pressable onPress={() => router.back()} hitSlop={12} className="h-10 w-10 items-center justify-center">
        <Ionicons name="arrow-back" size={22} color={colors.ink} />
      </Pressable>
      <Text className="flex-1 px-2 text-center text-lg font-semibold text-ink" numberOfLines={1}>
        {credential.title}
      </Text>
      <Pressable
        onPress={() => setEditing((v) => !v)}
        hitSlop={12}
        className="h-10 w-10 items-center justify-center"
      >
        <Ionicons name={editing ? "close" : "create-outline"} size={22} color={colors.ink} />
      </Pressable>
    </View>
  );

  if (editing) {
    return (
      <Screen scroll>
        {header}
        <View className="gap-4">
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextField
                label="Title"
                error={errors.title?.message}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <TextField
                label="Username / email"
                autoCapitalize="none"
                error={errors.username?.message}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordField
                label="Password"
                showStrength
                error={errors.password?.message}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="url"
            render={({ field }) => (
              <TextField
                label="Website (optional)"
                autoCapitalize="none"
                keyboardType="url"
                error={errors.url?.message}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <TextField
                label="Notes (optional)"
                multiline
                numberOfLines={3}
                error={errors.notes?.message}
                value={field.value}
                onChangeText={field.onChange}
                style={{ minHeight: 90, textAlignVertical: "top" }}
              />
            )}
          />
        </View>
        <View className="mb-6 mt-8">
          <Button title="Save changes" onPress={handleSubmit(onSave)} loading={isSubmitting} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {header}

      <View className="gap-4">
        <View className="rounded-xl2 border border-line bg-card p-4">
          <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-subtle">
            Username
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-base text-ink" numberOfLines={1}>
              {credential.username}
            </Text>
            <Pressable onPress={onCopyUsername} hitSlop={8} className="pl-3">
              <Ionicons name="copy-outline" size={20} color={colors.subtle} />
            </Pressable>
          </View>
        </View>

        <View className="rounded-xl2 border border-line bg-card p-4">
          <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-subtle">
            Password
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 font-mono text-base text-ink" numberOfLines={1}>
              {visible && revealed ? revealed : "••••••••••••"}
            </Text>
            <View className="flex-row items-center gap-4 pl-3">
              {showPasswordMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.subtle} />
              ) : (
                <Pressable onPress={onToggleVisible} hitSlop={8}>
                  <Ionicons
                    name={visible ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.subtle}
                  />
                </Pressable>
              )}
              <Pressable onPress={onCopyPassword} hitSlop={8}>
                <Ionicons name="copy-outline" size={20} color={colors.subtle} />
              </Pressable>
            </View>
          </View>
        </View>

        {credential.url ? (
          <Pressable
            onPress={() => Linking.openURL(normalizeUrl(credential.url as string))}
            className="rounded-xl2 border border-line bg-card p-4"
          >
            <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-subtle">
              Website
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-base text-accent" numberOfLines={1}>
                {credential.url}
              </Text>
              <Ionicons name="open-outline" size={18} color={colors.accent} />
            </View>
          </Pressable>
        ) : null}

        {credential.notes ? (
          <View className="rounded-xl2 border border-line bg-card p-4">
            <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-subtle">
              Notes
            </Text>
            <Text className="text-base text-ink">{credential.notes}</Text>
          </View>
        ) : null}
      </View>

      <View className="mb-8 mt-8">
        <Button
          title={confirmingDelete ? "Tap again to confirm delete" : "Delete credential"}
          variant="danger"
          onPress={onDelete}
          loading={deleteMutation.isPending}
        />
      </View>
    </Screen>
  );
}

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
