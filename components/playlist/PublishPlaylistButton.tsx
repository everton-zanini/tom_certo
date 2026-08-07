"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { publishPlaylist } from "@/services/playlist.actions";

export function PublishPlaylistButton({ playlistId }: { playlistId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handlePublish() {
    startTransition(async () => {
      try {
        await publishPlaylist(playlistId);
        toast.success("Repertório publicado");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao publicar repertório");
      }
    });
  }

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={handlePublish}>
      {isPending ? "Publicando..." : "Publicar"}
    </Button>
  );
}
