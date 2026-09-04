import { useRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
};

// Six visible "cells" driven by one invisible TextInput overlay — a standard
// cross-platform OTP-entry pattern that avoids per-cell focus management.
export function OtpInput({ value, onChange, length = 6, autoFocus = true }: Props) {
  const inputRef = useRef<TextInput>(null);
  const cells = Array.from({ length }, (_, i) => value[i] ?? "");

  return (
    <Pressable onPress={() => inputRef.current?.focus()} className="w-full">
      <View className="flex-row justify-between">
        {cells.map((char, i) => {
          const isActive = i === value.length;
          return (
            <View
              key={i}
              className={`h-14 w-12 items-center justify-center rounded-xl2 border bg-card ${
                isActive ? "border-accent" : "border-line"
              }`}
            >
              <Text className="text-xl font-semibold text-ink">{char}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, "").slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        className="absolute h-14 w-full opacity-0"
      />
    </Pressable>
  );
}
