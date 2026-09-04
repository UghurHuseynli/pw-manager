// Mirrors app/schemas/*.py and app/db/*.py response models exactly.

export type Token = {
  access_token: string;
  token_type: string;
};

export type Message = {
  message: string;
};

export type UserPublic = {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_otp: boolean;
  is_superuser: boolean;
};

export type UserSignUpResponse = UserPublic & {
  message: string;
};

export type CredentialListItem = {
  id: string;
  title: string;
};

export type CredentialsPublic = {
  count: number;
  data: CredentialListItem[];
};

export type CredentialDetail = {
  id: string;
  title: string;
  url: string | null;
  notes: string | null;
  username: string;
  created_at: string;
  updated_at: string | null;
};

export type PasswordReveal = {
  password: string;
};

export type CredentialCreateInput = {
  title: string;
  url?: string;
  notes?: string;
  username: string;
  password: string;
};

export type CredentialUpdateInput = Partial<CredentialCreateInput>;

export type ApiErrorBody = {
  detail?: string | Record<string, string> | Array<{ msg: string }>;
};

// --- Admin ---

export type UsersPublic = {
  count: number;
  data: UserPublic[];
};

export type AdminUserDetail = {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_otp: boolean;
  created_at: string;
  updated_at: string | null;
  last_login: string | null;
};

export type AdminUserCreateInput = {
  username: string;
  email: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
};

export type AdminUserUpdateInput = {
  username?: string;
  email?: string;
  is_active?: boolean;
  is_superuser?: boolean;
};

export type CredentialAdminDetail = CredentialDetail & {
  user_id: string;
};

export type AdminCredentialUpdateInput = Partial<CredentialCreateInput> & {
  user_id?: string;
};
