import { api } from "./client";
import type { Message, UserPublic } from "./types";

export function getMe(token: string) {
  return api.get<UserPublic>("/users/me", token);
}

export function updateMe(params: { username?: string; email?: string }, token: string) {
  return api.patch<UserPublic>("/users/me", params, token);
}

export function changePassword(
  params: { old_password: string; new_password: string },
  token: string,
) {
  return api.post<Message>("/users/me/change-password", params, token);
}

export function deleteMe(token: string) {
  return api.delete<Message>("/users/me", token);
}

export function disable2fa(token: string) {
  return api.post<Message>("/users/2fa/disable", undefined, token);
}

// POST (returns image/png, not JSON) — fetched via fetchAuthedBlob, see
// components/QrCodeImage.tsx.
export const ENABLE_2FA_PATH = "/users/2fa/enable";

