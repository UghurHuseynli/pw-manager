import { useState } from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../src/components/ui/Screen";
import { TextField } from "../../src/components/ui/TextField";
import { PasswordField } from "../../src/components/ui/PasswordField";
import { Button } from "../../src/components/ui/Button";
import { OtpInput } from "../../src/components/ui/OtpInput";
import { useToast } from "../../src/components/Toast";
import { useAuthStore } from "../../src/store/auth-store";
import * as authApi from "../../src/api/auth";
import { ApiError } from "../../src/api/client";
import { loginSchema, type LoginInput } from "../../src/utils/validation";

export default function LoginScreen() {
  const toast = useToast();
  const login = useAuthStore((s) => s.login);
  const [stage, setStage] = useState<"credentials" | "otp">("credentials");
  const [pending, setPending] = useState<{ email: string; password: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const attemptLogin = async (email: string, password: string, code?: string) => {
    const token = await authApi.login({ email, password, otp: code });
    await login(token.access_token);
  };

  const onSubmit = async (values: LoginInput) => {
    try {
      await attemptLogin(values.email, values.password);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setPending({ email: values.email, password: values.password });
        setStage("otp");
        return;
      }
      toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
    }
  };

  const onSubmitOtp = async () => {
    if (!pending || otp.length < 6) return;
    setOtpSubmitting(true);
    setOtpError(null);
    try {
      await attemptLogin(pending.email, pending.password, otp);
    } catch (e) {
      setOtpError(e instanceof ApiError ? e.message : "Something went wrong");
      setOtp("");
    } finally {
      setOtpSubmitting(false);
    }
  };

  if (stage === "otp") {
    return (
      <Screen scroll center>
        <View className="mb-10">
          <Text className="text-3xl font-bold text-ink">Two-factor code</Text>
          <Text className="mt-2 text-base text-subtle">
            Enter the 6-digit code from your authenticator app.
          </Text>
        </View>

        <OtpInput value={otp} onChange={setOtp} />
        {otpError ? <Text className="mt-3 text-sm text-danger">{otpError}</Text> : null}

        <View className="mt-8 gap-3">
          <Button
            title="Verify"
            onPress={onSubmitOtp}
            loading={otpSubmitting}
            disabled={otp.length < 6}
          />
          <Button
            title="Back"
            variant="ghost"
            onPress={() => {
              setStage("credentials");
              setOtp("");
              setOtpError(null);
            }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll center>
      <View className="mb-10">
        <Text className="text-3xl font-bold text-ink">Welcome back</Text>
        <Text className="mt-2 text-base text-subtle">Sign in to unlock your vault.</Text>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
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
              placeholder="••••••••"
              error={errors.password?.message}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        <Link href="/(auth)/forgot-password" asChild>
          <Text className="self-end text-sm font-medium text-accent">Forgot password?</Text>
        </Link>
      </View>

      <View className="mt-8">
        <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      </View>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-sm text-subtle">Don't have an account? </Text>
        <Link href="/(auth)/signup" asChild>
          <Text className="text-sm font-semibold text-accent">Sign up</Text>
        </Link>
      </View>
    </Screen>
  );
}
