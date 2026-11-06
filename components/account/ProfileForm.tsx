"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOwnTom } from "@/services/user.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TomSelect } from "@/components/user/TomSelect";
import { useLoadingOverlay } from "@/components/providers/loading-overlay-provider";

export function ProfileForm({ tom: initialTom }: { tom: string | null }) {
  const { runWithOverlay } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();
  const [tom, setTom] = useState<string | null>(initialTom);

  function save() {
    startTransition(async () => {
      await runWithOverlay(async () => {
        try {
          await updateOwnTom({ tom });
          toast.success("Tom atualizado");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao atualizar tom");
        }
      }, "Salvando...");
    });
  }

  return (
    <div className="flex max-w-sm flex-col gap-2">
      <Label htmlFor="tom">Tom em que eu canto</Label>
      <div className="flex items-center gap-2">
        <TomSelect id="tom" value={tom} onChange={setTom} disabled={isPending} />
        <Button size="sm" disabled={isPending || tom === initialTom} onClick={save}>
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
