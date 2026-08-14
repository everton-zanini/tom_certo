"use client";

import { useTransition } from "react";
import { logout } from "@/services/auth.actions";
import { Button } from "@/components/ui/button";
import { useLoadingOverlay } from "@/components/providers/loading-overlay-provider";

export function LogoutButton() {
  const { runWithOverlay } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await runWithOverlay(() => logout(), "Saindo...");
    });
  }

  return (
    <Button variant="ghost" size="sm" disabled={isPending} onClick={handleLogout}>
      Sair
    </Button>
  );
}
