import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth-store";
import * as usersApi from "../api/users";

export function useUpdateProfile() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: { username?: string; email?: string }) =>
      usersApi.updateMe(input, token as string),
    onSuccess: (user) => setUser(user),
  });
}

export function useChangePassword() {
  const token = useAuthStore((s) => s.token);
  return useMutation({
    mutationFn: (input: { old_password: string; new_password: string }) =>
      usersApi.changePassword(input, token as string),
  });
}

export function useDisable2fa() {
  const token = useAuthStore((s) => s.token);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: () => usersApi.disable2fa(token as string),
    onSuccess: () => refreshUser(),
  });
}

export function useDeleteAccount() {
  const token = useAuthStore((s) => s.token);
  return useMutation({
    mutationFn: () => usersApi.deleteMe(token as string),
  });
}
