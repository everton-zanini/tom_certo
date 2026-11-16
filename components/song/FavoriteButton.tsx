"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/services/favorite.actions";
import { useLoadingOverlay } from "@/components/providers/loading-overlay-provider";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  songId,
  initialFavorited,
  onChange,
}: {
  songId: string;
  initialFavorited: boolean;
  onChange?: (favorited: boolean) => void;
}) {
  const { runWithOverlay } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();
  const [favorited, setOptimisticFavorited] = useOptimistic(initialFavorited);

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      onClick={() => {
        startTransition(async () => {
          setOptimisticFavorited(!favorited);
          const result = await runWithOverlay(() => toggleFavorite(songId), "Atualizando favorito...");
          onChange?.(result.favorited);
        });
      }}
    >
      <Heart className={cn("size-4", favorited && "fill-current text-red-500")} />
    </Button>
  );
}
