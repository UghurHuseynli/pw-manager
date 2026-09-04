import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Animated, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../theme/colors";

type ToastVariant = "success" | "error" | "info";
type ToastState = { message: string; variant: ToastVariant } | null;

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const iconByVariant: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  error: "alert-circle",
  info: "information-circle",
};

export function ToastProvider({ children }: PropsWithChildren) {
  const colors = useColors();
  const colorByVariant: Record<ToastVariant, string> = {
    success: colors.success,
    error: colors.danger,
    info: colors.accent,
  };
  const [toast, setToast] = useState<ToastState>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setToast({ message, variant });
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timeoutRef.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(
          () => setToast(null),
        );
      }, 2600);
    },
    [opacity],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        // NativeWind's `className` support does not reliably reach
        // react-native's built-in Animated.View (a known interop gap, worse
        // on some react-native-reanimated versions) — it would silently
        // drop bg/border/flex-row, leaving unstyled default-column layout
        // with the screen's own background showing through as "white on
        // white". Keep the Animated.View style-only (position + opacity)
        // and put every themed class on a plain, non-animated View inside it.
        <Animated.View
          pointerEvents="none"
          style={{ position: "absolute", bottom: 40, left: 20, right: 20, opacity }}
        >
          <View className="flex-row items-center rounded-xl2 border border-line bg-cardAlt px-4 py-3">
            <Ionicons
              name={iconByVariant[toast.variant]}
              size={20}
              color={colorByVariant[toast.variant]}
            />
            <Text className="ml-2 flex-1 text-sm font-medium text-ink">{toast.message}</Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}
