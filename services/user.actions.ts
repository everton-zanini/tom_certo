"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/authz";
import {
  changePasswordSchema,
  createUserSchema,
  resetPasswordSchema,
  updateUserActiveSchema,
  updateUserRoleSchema,
} from "@/types/schemas/user.schema";

export async function listUsers() {
  await requireRole("ADMIN");
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true },
    orderBy: { name: "asc" },
  });
}

export async function createUser(input: unknown) {
  await requireRole("ADMIN");
  const data = createUserSchema.parse(input);
  const passwordHash = await bcrypt.hash(data.password, 12);

  try {
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash, role: data.role },
    });
    revalidatePath("/admin/users");
    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Já existe um usuário com este email.");
    }
    throw error;
  }
}

export async function updateUserRole(input: unknown) {
  await requireRole("ADMIN");
  const { userId, role } = updateUserRoleSchema.parse(input);
  const user = await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return user;
}

export async function updateUserActive(input: unknown) {
  await requireRole("ADMIN");
  const { userId, active } = updateUserActiveSchema.parse(input);
  const user = await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/users");
  return user;
}

export async function changeOwnPassword(input: unknown) {
  const session = await requireAuth();
  const { currentPassword, newPassword } = changePasswordSchema.parse(input);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error("Senha atual incorreta.");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
}

/** Admin-driven reset for when a member forgets their password (there is no email/forgot-password flow). */
export async function resetUserPassword(input: unknown) {
  await requireRole("ADMIN");
  const { userId, newPassword } = resetPasswordSchema.parse(input);
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  revalidatePath("/admin/users");
}
