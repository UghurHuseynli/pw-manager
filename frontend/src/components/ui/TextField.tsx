import { forwardRef, ReactNode, useState } from "react";
import { Platform, Text, TextInput, TextInputProps, View } from "react-native";
import { useColors } from "../../theme/colors";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  rightElement?: ReactNode;
};

// react-native-web renders TextInput as a real <input>, which gets the
// browser's own focus ring on top of our border-color-on-focus styling —
// doubled outlines that look broken. We already show focus via the border,
// so drop the native outline on web only (unknown style keys are ignored on
// native, but being explicit avoids any doubt).
const noWebOutline =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as Record<string, string>) : undefined;

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, rightElement, onFocus, onBlur, className = "", style, ...rest },
  ref,
) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);

  return (
    <View className="w-full">
      {label ? <Text className="mb-1.5 text-sm font-medium text-subtle">{label}</Text> : null}
      <View
        className={`flex-row items-center rounded-xl2 border bg-card px-4 ${
          error ? "border-danger" : focused ? "border-accent" : "border-line"
        }`}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors.subtle}
          className={`flex-1 py-3.5 text-base text-ink ${className}`}
          style={[noWebOutline, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightElement}
      </View>
      {error ? <Text className="mt-1.5 text-sm text-danger">{error}</Text> : null}
    </View>
  );
});
