"use client";

import { useActionState, useEffect } from "react";
import { authenticate } from "@/services/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoadingOverlay } from "@/components/providers/loading-overlay-provider";

export function LoginForm() {
  const { show, hide } = useLoadingOverlay();
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  useEffect(() => {
    if (isPending) {
      show("Entrando...");
      return hide;
    }
  }, [isPending, show, hide]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
