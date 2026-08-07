"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addSongToPlaylist } from "@/services/playlist.actions";

export type PickableSong = { id: string; titulo: string; artista: string | null };

export function PlaylistSongPicker({
  playlistId,
  availableSongs,
  onAdded,
}: {
  playlistId: string;
  availableSongs: PickableSong[];
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = availableSongs.filter((s) =>
    `${s.titulo} ${s.artista ?? ""}`.toLowerCase().includes(query.toLowerCase())
  );

  function add(songId: string) {
    startTransition(async () => {
      await addSongToPlaylist(playlistId, songId);
      onAdded();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="self-start" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Adicionar música
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar música ao repertório</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Buscar música..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
          {filtered.map((song) => (
            <button
              key={song.id}
              disabled={isPending}
              onClick={() => add(song.id)}
              className="flex flex-col rounded-md p-2 text-left text-sm hover:bg-accent disabled:opacity-50"
            >
              <span className="font-medium">{song.titulo}</span>
              <span className="text-xs text-muted-foreground">{song.artista}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="p-2 text-sm text-muted-foreground">Nenhuma música disponível.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
