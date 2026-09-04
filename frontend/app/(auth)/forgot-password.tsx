import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../src/components/ui/Screen";
import { TextField } from "../../src/components/ui/TextField";
import { Button } from "../../src/components/ui/Button";
import { useToast } from "../../src/components/Toast";
import * as authApi from "../../src/api/auth";
import { ApiError } from "../../src/api/client";
import { useColors } from "../../src/theme/colors";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../../src/utils/validation";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const toast = useToast();
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    try {
      await authApi.requestPasswordRecovery(values.email);
      setSent(true);
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
    }
  };

  if (sent) {
    return (
      <Screen center>
        <View className="items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-accentSoft">
            <Ionicons name="mail-outline" size={28} color={colors.accent} />
          </View>
          <Text className="text-center text-2xl font-bold text-ink">Recovery email sent</Text>
          <Text className="mt-2 text-center text-base text-subtle">
            If an account exists for that email, a reset token is on its way.
          </Text>
          <View className="mt-8 w-full">
            <Button title="Enter reset token" onPress={() => router.push("/(auth)/reset-password")} />
          </View>
          <View className="mt-3 w-full">
            <Button title="Back to sign in" variant="ghost" onPress={() => router.replace("/(auth)")} />
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
        <Text className="text-3xl font-bold text-ink">Forgot password?</Text>
        <Text className="mt-2 text-base text-subtle">
          We'll send a recovery token to your email.
        </Text>
      </View>

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email?.message}
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />

      <View className="mt-8">
        <Button title="Send recovery email" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      </View>
    </Screen>
  );
}
