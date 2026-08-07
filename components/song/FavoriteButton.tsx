"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/services/favorite.actions";
import { cn } from "@/lib/utils";

export function FavoriteButton({ songId, initialFavorited }: { songId: string; initialFavorited: boolean }) {
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
          await toggleFavorite(songId);
        });
      }}
    >
      <Heart className={cn("size-4", favorited && "fill-current text-red-500")} />
    </Button>
  );
}
