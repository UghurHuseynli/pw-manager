# Vault — password manager frontend

Expo (React Native) app targeting **iOS, Android, and Web** from one codebase,
built against the FastAPI backend in `../app`.

## Stack

- **Expo Router** — file-based navigation (`app/`), with `Stack.Protected` gating
  the authenticated `(app)` group behind the auth `(auth)` group.
- **NativeWind** (Tailwind for React Native) — the "Midnight Vault" design system
  lives in `tailwind.config.js` / `src/theme/colors.ts`.
- **TanStack Query** — server state/caching for credentials and profile data.
- **Zustand** — the auth store (`src/store/auth-store.ts`): token, current user,
  hydration.
- **react-hook-form + zod** — every form's validation (`src/utils/validation.ts`).
- **expo-secure-store** — Keychain/Keystore-backed token storage on iOS/Android;
  `src/utils/storage.ts` falls back to `localStorage` on web (the only file in the
  app that branches on platform).

## Running it

```sh
cp .env.example .env   # EXPO_PUBLIC_API_URL, defaults to http://localhost:8000/api/v1
npm install
npm run web             # or: npx expo start, then scan the QR with Expo Go for iOS/Android
```

The backend needs to be running and its CORS origins need to include the Expo web
dev server (`http://localhost:8081`) — already set in the repo's `env.example`.
See `../README.md` for backend startup.

## Layout

```
app/(auth)/      login (index), signup, activate, forgot-password, reset-password
app/(app)/vault/ vault list, credential detail (reveal/copy/edit/delete), new credential
app/(app)/profile/ profile (edit username/email, logout, delete account),
                    change-password, security (2FA enable/disable)
src/api/         typed fetch client + one module per backend router
src/store/       auth-store.ts (zustand)
src/hooks/       react-query hooks over src/api
src/components/  Toast, VaultItemRow, QrCodeImage, and ui/ primitives
src/theme/       color tokens
src/utils/       storage adapter, zod schemas, password strength, clipboard
```

## Notes

- The 2FA-enable endpoint returns a protected PNG (needs the auth header), so it's
  fetched as a blob and rendered as a data URI (`src/components/QrCodeImage.tsx`) —
  a plain `<Image source={{uri}}>` can't attach an Authorization header.
- There's no refresh-token endpoint on the backend; an expired/invalid token just
  drops the user back to the login screen (`auth-store.hydrate()`).
