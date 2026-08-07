"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deactivateUser, updateUserRole } from "@/services/user.actions";
import { ResetPasswordButton } from "@/components/admin/ResetPasswordButton";
import type { Role } from "@prisma/client";

export type AdminUser = { id: string; name: string; email: string; role: Role; active: boolean };

export function UsersTable({ users }: { users: AdminUser[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggleRole(user: AdminUser) {
    startTransition(async () => {
      try {
        await updateUserRole({ userId: user.id, role: user.role === "ADMIN" ? "MEMBRO" : "ADMIN" });
        toast.success("Papel do usuário atualizado");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar papel do usuário");
      }
    });
  }

  function deactivate(user: AdminUser) {
    if (!confirm(`Desativar ${user.name}?`)) return;
    startTransition(async () => {
      try {
        await deactivateUser(user.id);
        toast.success("Usuário desativado");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao desativar usuário");
      }
    });
  }

  return (
    <div className="flex flex-col divide-y rounded-md border">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-3">
          <div>
            <p className="font-medium">
              {user.name} {!user.active && <Badge variant="outline">Inativo</Badge>}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{user.role === "ADMIN" ? "Administrador" : "Membro"}</Badge>
            <Button variant="outline" size="sm" disabled={isPending} onClick={() => toggleRole(user)}>
              Tornar {user.role === "ADMIN" ? "membro" : "admin"}
            </Button>
            <ResetPasswordButton userId={user.id} userName={user.name} />
            {user.active && (
              <Button variant="ghost" size="sm" disabled={isPending} onClick={() => deactivate(user)}>
                Desativar
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
