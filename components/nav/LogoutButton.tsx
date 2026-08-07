"use client";

import { logout } from "@/services/auth.actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button variant="ghost" size="sm" onClick={() => logout()}>
      Sair
    </Button>
  );
}
