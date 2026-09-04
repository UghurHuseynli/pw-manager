import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../../src/components/ui/Screen";
import { TextField } from "../../../src/components/ui/TextField";
import { PasswordField } from "../../../src/components/ui/PasswordField";
import { Button } from "../../../src/components/ui/Button";
import { useToast } from "../../../src/components/Toast";
import { useCreateCredential } from "../../../src/hooks/useCredentials";
import { ApiError } from "../../../src/api/client";
import { useColors } from "../../../src/theme/colors";
import { credentialSchema, type CredentialInput } from "../../../src/utils/validation";

export default function NewCredentialScreen() {
  const colors = useColors();
  const toast = useToast();
  const createMutation = useCreateCredential();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CredentialInput>({
    resolver: zodResolver(credentialSchema),
    defaultValues: { title: "", url: "", notes: "", username: "", password: "" },
  });

  const onSubmit = async (values: CredentialInput) => {
    try {
      await createMutation.mutateAsync({
        title: values.title,
        url: values.url || undefined,
        notes: values.notes || undefined,
        username: values.username,
        password: values.password,
      });
      toast.show("Credential added", "success");
      router.back();
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
    }
  };

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between pb-4 pt-3">
        <Text className="text-2xl font-bold text-ink">New credential</Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="close" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField
              label="Title"
              placeholder="e.g. GitHub"
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
              placeholder="you@example.com"
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
              placeholder="At least 8 characters"
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
              placeholder="github.com"
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
        <Button title="Save credential" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      </View>
    </Screen>
  );
}
