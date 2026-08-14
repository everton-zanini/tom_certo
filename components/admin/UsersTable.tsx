"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserOptionsDialog } from "@/components/admin/UserOptionsDialog";
import type { Role } from "@prisma/client";

export type AdminUser = { id: string; name: string; email: string; role: Role; active: boolean };

export function UsersTable({ users }: { users: AdminUser[] }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedUser = users.find((user) => user.id === selectedUserId);

  return (
    <div className="flex flex-col divide-y rounded-md border">
      {users.map((user) => (
        <button
          key={user.id}
          type="button"
          onClick={() => setSelectedUserId(user.id)}
          className="flex items-center justify-between gap-2 p-3 text-left hover:bg-muted/50"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">
              {user.name} {!user.active && <Badge variant="outline">Inativo</Badge>}
            </p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="secondary">{user.role === "ADMIN" ? "Administrador" : "Membro"}</Badge>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </button>
      ))}
      <UserOptionsDialog
        user={selectedUser}
        open={selectedUserId !== null}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
      />
    </div>
  );
}
