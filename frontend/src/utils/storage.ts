import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// expo-secure-store is Keychain/Keystore-backed on iOS/Android but has no
// web implementation, so this is the one module in the app that branches
// on platform — everything above it just calls getItem/setItem/deleteItem.
const isWeb = Platform.OS === "web";

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore (e.g. private browsing storage quota)
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const storage = { getItem, setItem, deleteItem };
