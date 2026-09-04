import { api } from "./client";
import type {
  AdminCredentialUpdateInput,
  AdminUserCreateInput,
  AdminUserDetail,
  AdminUserUpdateInput,
  CredentialAdminDetail,
  CredentialCreateInput,
  CredentialsPublic,
  Message,
  UsersPublic,
} from "./types";

// --- Users ---

export function listUsers(token: string, params?: { skip?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.skip) qs.set("skip", String(params.skip));
  if (params?.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return api.get<UsersPublic>(`/admin/users/${suffix}`, token);
}

export function getUser(id: string, token: string) {
  return api.get<AdminUserDetail>(`/admin/users/${id}`, token);
}

export function createUser(input: AdminUserCreateInput, token: string) {
  return api.post<AdminUserDetail>("/admin/users/", input, token);
}

export function updateUser(id: string, input: AdminUserUpdateInput, token: string) {
  return api.patch<AdminUserDetail>(`/admin/users/${id}`, input, token);
}

export function deleteUser(id: string, token: string) {
  return api.delete<Message>(`/admin/users/${id}`, token);
}

export function changeUserPassword(id: string, newPassword: string, token: string) {
  return api.post<Message>(`/admin/users/${id}/change-password`, { new_password: newPassword }, token);
}

export function disable2faForUser(id: string, token: string) {
  return api.post<Message>(`/admin/users/2fa/disable/${id}`, undefined, token);
}

// POST (returns image/png, not JSON) — fetched via fetchAuthedBlob, see
// components/QrCodeImage.tsx.
export function enable2faForUserPath(id: string): string {
  return `/admin/users/2fa/enable/${id}`;
}

// --- Credentials ---

export function listAdminCredentials(
  token: string,
  params?: { userId?: string; skip?: number; limit?: number },
) {
  const qs = new URLSearchParams();
  if (params?.userId) qs.set("user_id", params.userId);
  if (params?.skip) qs.set("skip", String(params.skip));
  if (params?.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return api.get<CredentialsPublic>(`/admin/credentials/${suffix}`, token);
}

export function getAdminCredential(id: string, token: string) {
  return api.get<CredentialAdminDetail>(`/admin/credentials/${id}`, token);
}

export function createAdminCredential(
  userId: string,
  input: CredentialCreateInput,
  token: string,
) {
  return api.post<CredentialAdminDetail>(
    `/admin/credentials/?user_id=${encodeURIComponent(userId)}`,
    input,
    token,
  );
}

export function updateAdminCredential(
  id: string,
  input: AdminCredentialUpdateInput,
  token: string,
) {
  return api.patch<CredentialAdminDetail>(`/admin/credentials/${id}`, input, token);
}

export function deleteAdminCredential(id: string, token: string) {
  return api.delete<Message>(`/admin/credentials/${id}`, token);
}
