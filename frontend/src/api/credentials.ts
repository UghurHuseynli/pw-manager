import { api } from "./client";
import type {
  CredentialCreateInput,
  CredentialDetail,
  CredentialUpdateInput,
  CredentialsPublic,
  Message,
  PasswordReveal,
} from "./types";

export function listCredentials(token: string, params?: { skip?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.skip) qs.set("skip", String(params.skip));
  if (params?.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return api.get<CredentialsPublic>(`/credentials/${suffix}`, token);
}

export function getCredential(id: string, token: string) {
  return api.get<CredentialDetail>(`/credentials/${id}`, token);
}

export function createCredential(input: CredentialCreateInput, token: string) {
  return api.post<CredentialDetail>("/credentials/", input, token);
}

export function updateCredential(id: string, input: CredentialUpdateInput, token: string) {
  return api.patch<CredentialDetail>(`/credentials/${id}`, input, token);
}

export function deleteCredential(id: string, token: string) {
  return api.delete<Message>(`/credentials/${id}`, token);
}

export function showPassword(id: string, token: string) {
  return api.get<PasswordReveal>(`/credentials/${id}/show-password`, token);
}
