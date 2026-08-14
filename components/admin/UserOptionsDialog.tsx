"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { resetPasswordSchema } from "@/types/schemas/user.schema";
import { resetUserPassword, updateUserActive, updateUserRole } from "@/services/user.actions";
import type { AdminUser } from "@/components/admin/UsersTable";
import { useLoadingOverlay } from "@/components/providers/loading-overlay-provider";

export function UserOptionsDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { runWithOverlay } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (!user) return null;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setConfirmingDeactivate(false);
      setNewPassword("");
      setPasswordError(null);
    }
    onOpenChange(next);
  }

  function toggleRole() {
    if (!user) return;
    startTransition(async () => {
      await runWithOverlay(async () => {
        try {
          await updateUserRole({ userId: user.id, role: user.role === "ADMIN" ? "MEMBRO" : "ADMIN" });
          toast.success("Papel do usuário atualizado");
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao atualizar papel do usuário");
        }
      }, "Atualizando papel...");
    });
  }

  function toggleActive() {
    if (!user) return;
    if (user.active && !confirmingDeactivate) {
      setConfirmingDeactivate(true);
      return;
    }
    setConfirmingDeactivate(false);
    startTransition(async () => {
      await runWithOverlay(async () => {
        try {
          await updateUserActive({ userId: user.id, active: !user.active });
          toast.success(user.active ? "Usuário desativado" : "Usuário reativado");
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao atualizar status do usuário");
        }
      }, "Atualizando status...");
    });
  }

  function handleResetPassword() {
    if (!user) return;
    const parsed = resetPasswordSchema.safeParse({ userId: user.id, newPassword });
    if (!parsed.success) {
      setPasswordError(parsed.error.issues[0]?.message ?? "Senha inválida");
      return;
    }
    setPasswordError(null);
    startTransition(async () => {
      await runWithOverlay(async () => {
        try {
          await resetUserPassword(parsed.data);
          toast.success("Senha redefinida");
          handleOpenChange(false);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erro ao redefinir senha";
          setPasswordError(message);
          toast.error(message);
        }
      }, "Salvando...");
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user.name}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{user.role === "ADMIN" ? "Administrador" : "Membro"}</Badge>
          {!user.active && <Badge variant="outline">Inativo</Badge>}
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" disabled={isPending} onClick={toggleRole} className="justify-start">
            Tornar {user.role === "ADMIN" ? "membro" : "admin"}
          </Button>
          <Button
            variant={confirmingDeactivate ? "destructive" : "ghost"}
            size="sm"
            disabled={isPending}
            onClick={toggleActive}
            className="justify-start"
          >
            {confirmingDeactivate
              ? "Confirmar desativação"
              : user.active
                ? "Desativar"
                : "Reativar"}
          </Button>
        </div>

        <div className="flex flex-col gap-2 border-t pt-4">
          <Label htmlFor="newPassword">Redefinir senha</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          <Button size="sm" disabled={isPending} onClick={handleResetPassword} className="self-start">
            {isPending ? "Salvando..." : "Redefinir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
