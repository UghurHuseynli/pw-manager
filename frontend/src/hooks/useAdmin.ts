import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth-store";
import * as adminApi from "../api/admin";
import type {
  AdminCredentialUpdateInput,
  AdminUserCreateInput,
  AdminUserUpdateInput,
  CredentialCreateInput,
} from "../api/types";

function useToken() {
  return useAuthStore((s) => s.token);
}

// --- Users ---

export function useAdminUsers() {
  const token = useToken();
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminApi.listUsers(token as string, { limit: 200 }),
    enabled: !!token,
  });
}

export function useAdminUser(id: string | undefined) {
  const token = useToken();
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: () => adminApi.getUser(id as string, token as string),
    enabled: !!token && !!id,
  });
}

export function useCreateAdminUser() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminUserCreateInput) => adminApi.createUser(input, token as string),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUpdateAdminUser(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminUserUpdateInput) => adminApi.updateUser(id, input, token as string),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.setQueryData(["admin", "user", id], data);
    },
  });
}

export function useDeleteAdminUser() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id, token as string),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useChangeUserPassword(id: string) {
  const token = useToken();
  return useMutation({
    mutationFn: (newPassword: string) =>
      adminApi.changeUserPassword(id, newPassword, token as string),
  });
}

export function useDisable2faForUser(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.disable2faForUser(id, token as string),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "user", id] }),
  });
}

// --- Credentials ---

export function useAdminCredentials(userId?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["admin", "credentials", userId ?? "all"],
    queryFn: () => adminApi.listAdminCredentials(token as string, { userId, limit: 200 }),
    enabled: !!token,
  });
}

export function useAdminCredential(id: string | undefined) {
  const token = useToken();
  return useQuery({
    queryKey: ["admin", "credential", id],
    queryFn: () => adminApi.getAdminCredential(id as string, token as string),
    enabled: !!token && !!id,
  });
}

export function useCreateAdminCredential() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: CredentialCreateInput }) =>
      adminApi.createAdminCredential(userId, input, token as string),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "credentials"] }),
  });
}

export function useUpdateAdminCredential(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminCredentialUpdateInput) =>
      adminApi.updateAdminCredential(id, input, token as string),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin", "credentials"] });
      qc.setQueryData(["admin", "credential", id], data);
    },
  });
}

export function useDeleteAdminCredential() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAdminCredential(id, token as string),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "credentials"] }),
  });
}
