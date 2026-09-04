import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { fetchAuthedBlob } from "../api/client";
import { ENABLE_2FA_PATH } from "../api/users";
import { useColors } from "../theme/colors";

function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

// The 2FA-enable endpoint returns a *protected* PNG (needs the Bearer
// header), so it can't be a plain <Image source={{uri: url}}> — fetch it
// as a blob and render it as a data URI instead.
//
// Note: the backend enables 2FA as a side effect of this same request (there
// is no separate "confirm" step) — `onLoaded` fires once the image is ready
// so the caller can refresh the user's `is_otp` state.
export function QrCodeImage({
  token,
  path = ENABLE_2FA_PATH,
  onLoaded,
}: {
  token: string;
  /** Defaults to the self-service enable path; pass the admin path to enable 2FA for another user. */
  path?: string;
  onLoaded?: () => void;
}) {
  const colors = useColors();
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const blob = await fetchAuthedBlob(path, token);
        const dataUri = await blobToDataUri(blob);
        if (!cancelled) {
          setUri(dataUri);
          onLoaded?.();
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, path]);

  if (error) {
    return (
      <View className="h-56 w-56 items-center justify-center rounded-xl2 border border-line bg-card">
        <Text className="text-sm text-danger">Couldn't load QR code</Text>
      </View>
    );
  }

  if (!uri) {
    return (
      <View className="h-56 w-56 items-center justify-center rounded-xl2 border border-line bg-card">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    // Always a plain white frame, regardless of theme — the PNG itself needs
    // guaranteed contrast to stay scannable, independent of `ink`/`app` which
    // now flip with light/dark mode.
    <View className="items-center justify-center rounded-xl2 bg-white p-4">
      <Image source={{ uri }} style={{ width: 200, height: 200 }} />
    </View>
  );
}
