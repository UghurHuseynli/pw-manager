import { PropsWithChildren } from "react";
import { View, ViewProps } from "react-native";

type Props = PropsWithChildren<ViewProps & { className?: string }>;

export function Card({ children, className = "", ...rest }: Props) {
  return (
    <View
      className={`rounded-xl2 border border-line bg-card p-4 ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
