import { z } from "zod";

// Password bounds mirror app/db/users.py / app/db/credentials.py (min 8, max 40).
const password = z
  .string()
  .min(8, "Must be at least 8 characters")
  .max(40, "Must be at most 40 characters");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  otp: z.string().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    username: z.string().min(3, "At least 3 characters"),
    email: z.string().email("Enter a valid email"),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Paste the token from your recovery email"),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Enter your current password"),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different",
    path: ["newPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const profileSchema = z.object({
  username: z.string().min(3, "At least 3 characters"),
  email: z.string().email("Enter a valid email"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const credentialSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000, "At most 1000 characters").optional().or(z.literal("")),
  username: z.string().min(1, "Username / email is required"),
  password,
});
export type CredentialInput = z.infer<typeof credentialSchema>;

// --- Admin ---

export const adminCreateUserSchema = z.object({
  username: z.string().min(3, "At least 3 characters"),
  email: z.string().email("Enter a valid email"),
  password,
  isActive: z.boolean(),
  isSuperuser: z.boolean(),
});
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;

export const adminEditUserSchema = z.object({
  username: z.string().min(3, "At least 3 characters"),
  email: z.string().email("Enter a valid email"),
  isActive: z.boolean(),
  isSuperuser: z.boolean(),
});
export type AdminEditUserInput = z.infer<typeof adminEditUserSchema>;

export const adminForcePasswordSchema = z
  .object({
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type AdminForcePasswordInput = z.infer<typeof adminForcePasswordSchema>;

// Same shape as `credentialSchema`, but the password is optional — admins
// can set a new one but the backend never exposes the existing value to them.
export const adminCredentialEditSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000, "At most 1000 characters").optional().or(z.literal("")),
  username: z.string().min(1, "Username / email is required"),
  password: password.optional().or(z.literal("")),
});
export type AdminCredentialEditInput = z.infer<typeof adminCredentialEditSchema>;
