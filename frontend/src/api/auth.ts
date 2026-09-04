import { api } from "./client";
import type { Message, Token, UserPublic, UserSignUpResponse } from "./types";

export function login(params: { email: string; password: string; otp?: string }) {
  const form: Record<string, string> = {
    username: params.email,
    password: params.password,
  };
  if (params.otp) form.otp = params.otp;
  return api.postForm<Token>("/login/access-token", form);
}

export function signup(params: { username: string; email: string; password: string }) {
  return api.post<UserSignUpResponse>("/users/signup", params);
}

export function activateAccount(token: string) {
  return api.post<UserPublic>(`/users/activate?token=${encodeURIComponent(token)}`);
}

export function requestPasswordRecovery(email: string) {
  return api.post<Message>(`/password-recovery/${encodeURIComponent(email)}`);
}

export function resetPassword(params: { token: string; new_password: string }) {
  return api.post<Message>("/reset-password/", params);
}
