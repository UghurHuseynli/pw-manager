import { forwardRef, useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextField } from "./TextField";
import { useColors } from "../../theme/colors";
import { getPasswordStrength } from "../../utils/password-strength";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  showStrength?: boolean;
};

export const PasswordField = forwardRef<TextInput, Props>(function PasswordField(
  { label, error, showStrength = false, value, ...rest },
  ref,
) {
  const colors = useColors();
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getPasswordStrength(String(value ?? "")) : null;

  return (
    <View className="w-full">
      <TextField
        ref={ref}
        label={label}
        error={error}
        value={value}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        rightElement={
          <Pressable hitSlop={8} onPress={() => setVisible((v) => !v)} className="pl-2">
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.subtle}
            />
          </Pressable>
        }
        {...rest}
      />

      {strength && String(value ?? "").length > 0 ? (
        <View className="mt-2">
          <View className="h-1.5 flex-row gap-1">
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                className={`h-full flex-1 rounded-full ${
                  i <= strength.score
                    ? strength.color === "danger"
                      ? "bg-danger"
                      : strength.color === "warning"
                        ? "bg-warning"
                        : "bg-success"
                    : "bg-line"
                }`}
              />
            ))}
          </View>
          <Text className="mt-1 text-xs text-subtle">{strength.label}</Text>
        </View>
      ) : null}
    </View>
  );
});
