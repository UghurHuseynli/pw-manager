import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../src/components/ui/Screen";
import { TextField } from "../../src/components/ui/TextField";
import { PasswordField } from "../../src/components/ui/PasswordField";
import { Button } from "../../src/components/ui/Button";
import { useToast } from "../../src/components/Toast";
import * as authApi from "../../src/api/auth";
import { ApiError } from "../../src/api/client";
import { useColors } from "../../src/theme/colors";
import { resetPasswordSchema, type ResetPasswordInput } from "../../src/utils/validation";

export default function ResetPasswordScreen() {
  const colors = useColors();
  const toast = useToast();
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    try {
      await authApi.resetPassword({ token: values.token, new_password: values.newPassword });
      setDone(true);
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
    }
  };

  if (done) {
    return (
      <Screen center>
        <View className="items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-accentSoft">
            <Ionicons name="checkmark-circle-outline" size={30} color={colors.success} />
          </View>
          <Text className="text-center text-2xl font-bold text-ink">Password updated</Text>
          <Text className="mt-2 text-center text-base text-subtle">
            Sign in with your new password.
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
        <Text className="text-3xl font-bold text-ink">Reset password</Text>
        <Text className="mt-2 text-base text-subtle">
          Paste the token from your recovery email and choose a new password.
        </Text>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="token"
          render={({ field }) => (
            <TextField
              label="Reset token"
              placeholder="Paste token here"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.token?.message}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="newPassword"
          render={({ field }) => (
            <PasswordField
              label="New password"
              placeholder="At least 8 characters"
              showStrength
              error={errors.newPassword?.message}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <PasswordField
              label="Confirm new password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
      </View>

      <View className="mt-8">
        <Button title="Update password" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      </View>
    </Screen>
  );
}
