import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  role: z.enum(["ADMIN", "MEMBRO"]).default("MEMBRO"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "MEMBRO"]),
});

export const updateUserActiveSchema = z.object({
  userId: z.string().min(1),
  active: z.boolean(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual"),
  newPassword: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  newPassword: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
