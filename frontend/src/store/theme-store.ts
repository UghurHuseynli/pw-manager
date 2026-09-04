import { create } from "zustand";
import { Appearance } from "react-native";
import { storage } from "../utils/storage";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedScheme = "light" | "dark";

const THEME_KEY = "pw_vault_theme";

function systemSchemeNow(): ResolvedScheme {
  return Appearance.getColorScheme() === "light" ? "light" : "dark";
}

type ThemeState = {
  preference: ThemePreference;
  systemScheme: ResolvedScheme;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPreference: (preference: ThemePreference) => void;
  resolvedScheme: () => ResolvedScheme;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: "system",
  systemScheme: systemSchemeNow(),
  hydrated: false,

  hydrate: async () => {
    const saved = await storage.getItem(THEME_KEY);
    const preference: ThemePreference =
      saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    set({ preference, hydrated: true });
  },

  setPreference: (preference: ThemePreference) => {
    set({ preference });
    storage.setItem(THEME_KEY, preference);
  },

  resolvedScheme: () => {
    const { preference, systemScheme } = get();
    return preference === "system" ? systemScheme : preference;
  },
}));

Appearance.addChangeListener(({ colorScheme }) => {
  useThemeStore.setState({ systemScheme: colorScheme === "light" ? "light" : "dark" });
});
