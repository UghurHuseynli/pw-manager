import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../../../src/components/ui/Screen";
import { TextField } from "../../../../src/components/ui/TextField";
import { PasswordField } from "../../../../src/components/ui/PasswordField";
import { Button } from "../../../../src/components/ui/Button";
import { Toggle } from "../../../../src/components/ui/Toggle";
import { useToast } from "../../../../src/components/Toast";
import { useCreateAdminUser } from "../../../../src/hooks/useAdmin";
import { ApiError } from "../../../../src/api/client";
import { useColors } from "../../../../src/theme/colors";
import { adminCreateUserSchema, type AdminCreateUserInput } from "../../../../src/utils/validation";

export default function NewAdminUserScreen() {
  const colors = useColors();
  const toast = useToast();
  const createUser = useCreateAdminUser();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminCreateUserInput>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      isActive: true,
      isSuperuser: false,
    },
  });

  const onSubmit = async (values: AdminCreateUserInput) => {
    try {
      await createUser.mutateAsync({
        username: values.username,
        email: values.email,
        password: values.password,
        is_active: values.isActive,
        is_superuser: values.isSuperuser,
      });
      toast.show("User created", "success");
      router.back();
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : "Something went wrong", "error");
    }
  };

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between pb-4 pt-3">
        <Text className="text-2xl font-bold text-ink">New user</Text>
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
          name="isActive"
          render={({ field }) => (
            <Toggle
              label="Active"
              description="Inactive accounts can't sign in."
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="isSuperuser"
          render={({ field }) => (
            <Toggle
              label="Admin"
              description="Grants access to this admin panel."
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
      </View>

      <View className="mb-6 mt-8">
        <Button title="Create user" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      </View>
    </Screen>
  );
}
