import { create } from "zustand";
import { storage } from "../utils/storage";
import { getMe } from "../api/users";
import type { UserPublic } from "../api/types";

const TOKEN_KEY = "pw_vault_token";

type AuthState = {
  token: string | null;
  user: UserPublic | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: UserPublic) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  hydrated: false,

  hydrate: async () => {
    const token = await storage.getItem(TOKEN_KEY);
    if (!token) {
      set({ hydrated: true });
      return;
    }
    try {
      const user = await getMe(token);
      set({ token, user, hydrated: true });
    } catch {
      // token expired/invalid — drop it silently and send the user to login
      await storage.deleteItem(TOKEN_KEY);
      set({ token: null, user: null, hydrated: true });
    }
  },

  login: async (token: string) => {
    const user = await getMe(token);
    await storage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  logout: async () => {
    await storage.deleteItem(TOKEN_KEY);
    set({ token: null, user: null });
  },

  refreshUser: async () => {
    const token = get().token;
    if (!token) return;
    const user = await getMe(token);
    set({ user });
  },

  setUser: (user: UserPublic) => set({ user }),
}));
