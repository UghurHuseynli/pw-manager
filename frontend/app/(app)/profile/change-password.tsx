import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../../src/components/ui/Screen";
import { PasswordField } from "../../../src/components/ui/PasswordField";
import { Button } from "../../../src/components/ui/Button";
import { useToast } from "../../../src/components/Toast";
import { useChangePassword } from "../../../src/hooks/useUser";
import { ApiError } from "../../../src/api/client";
import { useColors } from "../../../src/theme/colors";
import { changePasswordSchema, type ChangePasswordInput } from "../../../src/utils/validation";

export default function ChangePasswordScreen() {
  const colors = useColors();
  const toast = useToast();
  const changePassword = useChangePassword();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ChangePasswordInput) => {
    try {
      await changePassword.mutateAsync({
        old_password: values.oldPassword,
        new_password: values.newPassword,
      });
      toast.show("Password changed", "success");
      reset();
      router.back();
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
        <Text className="text-2xl font-bold text-ink">Change password</Text>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="oldPassword"
          render={({ field }) => (
            <PasswordField
              label="Current password"
              error={errors.oldPassword?.message}
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
