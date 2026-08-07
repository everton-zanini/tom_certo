import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

export class AuthzError extends Error {}

/** Throws if there is no authenticated session. Call at the top of every mutating Server Action. */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new AuthzError("UNAUTHENTICATED");
  return session;
}

/** Throws unless the current session has (at least) the given role. */
export async function requireRole(role: Role) {
  const session = await requireAuth();
  if (role === "ADMIN" && session.user.role !== "ADMIN") {
    throw new AuthzError("FORBIDDEN");
  }
  return session;
}
