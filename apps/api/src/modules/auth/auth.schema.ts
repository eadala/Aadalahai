import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("invalid_format"),
  password: z
    .string()
    .min(8, "too_short")
    .max(128, "too_long")
    .regex(/[A-Z]/, "needs_uppercase")
    .regex(/[a-z]/, "needs_lowercase")
    .regex(/[0-9]/, "needs_digit"),
  name: z.string().min(2, "too_short").max(255, "too_long"),
});

export const loginSchema = z.object({
  email: z.string().email("invalid_format"),
  password: z.string().min(1, "required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "required"),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: AuthTokens;
}
