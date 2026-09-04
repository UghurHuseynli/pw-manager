import { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = PropsWithChildren<{
  scroll?: boolean;
  center?: boolean;
  className?: string;
}>;

export function Screen({ children, scroll = false, center = false, className = "" }: Props) {
  const content = (
    <View
      className={`flex-1 px-5 ${center ? "justify-center" : ""} ${className}`}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-app" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
