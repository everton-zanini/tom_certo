"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { resetPasswordSchema } from "@/types/schemas/user.schema";
import { resetUserPassword } from "@/services/user.actions";

export function ResetPasswordButton({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const parsed = resetPasswordSchema.safeParse({ userId, newPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Senha inválida");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await resetUserPassword(parsed.data);
        toast.success("Senha redefinida");
        setOpen(false);
        setNewPassword("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao redefinir senha");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Redefinir senha
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redefinir senha de {userName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">Nova senha</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button onClick={handleSubmit} disabled={isPending} className="self-start">
          {isPending ? "Salvando..." : "Redefinir"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
