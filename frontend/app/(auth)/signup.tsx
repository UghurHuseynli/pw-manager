import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Link, router } from "expo-router";
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
import { signupSchema, type SignupInput } from "../../src/utils/validation";

export default function SignupScreen() {
  const colors = useColors();
  const toast = useToast();
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: SignupInput) => {
    try {
      await authApi.signup(values);
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
            <Ionicons name="mail-outline" size={28} color={colors.accent} />
          </View>
          <Text className="text-center text-2xl font-bold text-ink">Check your inbox</Text>
          <Text className="mt-2 text-center text-base text-subtle">
            We sent an activation link to your email. Activate your account, then sign in.
          </Text>
          <View className="mt-8 w-full">
            <Button title="Go to activation" onPress={() => router.replace("/(auth)/activate")} />
          </View>
          <View className="mt-3 w-full">
            <Button
              title="Back to sign in"
              variant="ghost"
              onPress={() => router.replace("/(auth)")}
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()} hitSlop={12} className="mb-4 mt-2 h-10 w-10 items-center justify-center">
        <Ionicons name="arrow-back" size={22} color={colors.ink} />
      </Pressable>

      <View className="mb-8">
        <Text className="text-3xl font-bold text-ink">Create your vault</Text>
        <Text className="mt-2 text-base text-subtle">It only takes a minute.</Text>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="username"
          render={({ field }) => (
            <TextField
              label="Username"
              placeholder="alex"
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
              placeholder="you@example.com"
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
          name="confirmPassword"
          render={({ field }) => (
            <PasswordField
              label="Confirm password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
      </View>

      <View className="mt-8">
        <Button title="Create account" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      </View>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-sm text-subtle">Already have an account? </Text>
        <Link href="/(auth)" asChild>
          <Text className="text-sm font-semibold text-accent">Sign in</Text>
        </Link>
      </View>
    </Screen>
  );
}
