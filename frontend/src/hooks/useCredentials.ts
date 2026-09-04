import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth-store";
import * as credentialsApi from "../api/credentials";
import type { CredentialCreateInput, CredentialUpdateInput } from "../api/types";

function useToken() {
  return useAuthStore((s) => s.token);
}

export function useCredentialsList() {
  const token = useToken();
  return useQuery({
    queryKey: ["credentials"],
    queryFn: () => credentialsApi.listCredentials(token as string, { limit: 200 }),
    enabled: !!token,
  });
}

export function useCredential(id: string | undefined) {
  const token = useToken();
  return useQuery({
    queryKey: ["credential", id],
    queryFn: () => credentialsApi.getCredential(id as string, token as string),
    enabled: !!token && !!id,
  });
}

export function useCreateCredential() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CredentialCreateInput) =>
      credentialsApi.createCredential(input, token as string),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credentials"] }),
  });
}

export function useUpdateCredential(id: string) {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CredentialUpdateInput) =>
      credentialsApi.updateCredential(id, input, token as string),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["credentials"] });
      qc.setQueryData(["credential", id], data);
    },
  });
}

export function useDeleteCredential() {
  const token = useToken();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => credentialsApi.deleteCredential(id, token as string),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credentials"] }),
  });
}

export function useShowPassword() {
  const token = useToken();
  return useMutation({
    mutationFn: (id: string) => credentialsApi.showPassword(id, token as string),
  });
}
