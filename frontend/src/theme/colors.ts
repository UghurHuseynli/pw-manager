import { useThemeStore } from "../store/theme-store";

// Midnight Vault (dark) + its light counterpart — mirrors the CSS variables
// defined in global.css / tailwind.config.js. Keep key names identical
// across both palettes so every call site can stay theme-agnostic.
export const darkColors = {
  app: "#0B0B10",
  card: "#16161F",
  cardAlt: "#1C1C28",
  line: "#232330",
  ink: "#F4F4F7",
  subtle: "#8B8B95",
  accent: "#7C6CFF",
  accentSoft: "#2A2452",
  success: "#34D399",
  danger: "#F87171",
  warning: "#FBBF24",
} as const;

export const lightColors: Record<keyof typeof darkColors, string> = {
  app: "#F7F7FB",
  card: "#FFFFFF",
  cardAlt: "#F1F1F6",
  line: "#E4E4EC",
  ink: "#14141B",
  subtle: "#6B6B76",
  accent: "#6552E0",
  accentSoft: "#EDEBFC",
  success: "#16A34A",
  danger: "#DC2626",
  warning: "#D97706",
};

export type ColorToken = keyof typeof darkColors;
export type Palette = Record<ColorToken, string>;

/**
 * Static default (dark) palette — only for contexts outside a component
 * where hooks can't run. Prefer `useColors()` everywhere else so colors
 * actually update when the user switches theme.
 */
export const colors = darkColors;

/** Reactive palette — re-renders the caller when the resolved theme changes. */
export function useColors(): Palette {
  const resolved = useThemeStore((s) => s.resolvedScheme());
  return resolved === "light" ? lightColors : darkColors;
}

export function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

const cssVarNameByToken: Record<ColorToken, string> = {
  app: "--color-app",
  card: "--color-card",
  cardAlt: "--color-card-alt",
  line: "--color-line",
  ink: "--color-ink",
  subtle: "--color-subtle",
  accent: "--color-accent",
  accentSoft: "--color-accent-soft",
  success: "--color-success",
  danger: "--color-danger",
  warning: "--color-warning",
};

export function paletteToCssVars(palette: Palette): Record<string, string> {
  const vars: Record<string, string> = {};
  (Object.keys(palette) as ColorToken[]).forEach((token) => {
    vars[cssVarNameByToken[token]] = hexToRgbTriplet(palette[token]);
  });
  return vars;
}
