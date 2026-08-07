"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSong } from "@/services/song.actions";

export function DeleteSongButton({ songId }: { songId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Excluir esta música? Esta ação não pode ser desfeita.")) return;
    startTransition(async () => {
      try {
        await deleteSong(songId);
        toast.success("Música excluída");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao excluir música");
      }
    });
  }

  return (
    <Button variant="ghost" size="icon-sm" disabled={isPending} onClick={handleDelete} aria-label="Excluir música">
      <Trash2 className="size-4" />
    </Button>
  );
}
