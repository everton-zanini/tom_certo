"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { updatePlaylistSongNotes } from "@/services/playlist.actions";
import { NotaColorPicker } from "@/components/playlist/NotaColorPicker";
import { getNotaCor, type NotaCorValue } from "@/lib/nota-colors";
import { cn } from "@/lib/utils";

export type NotaAdminItem = {
  playlistId: string;
  songId: string;
  notas: string | null;
  cor: NotaCorValue | null;
  song: { titulo: string; artista: string | null };
  playlist: { nome: string; data: Date };
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function NotaRow({ item }: { item: NotaAdminItem }) {
  const [notas, setNotas] = useState(item.notas ?? "");
  const [cor, setCor] = useState<NotaCorValue | null>(item.cor);
  const [, startTransition] = useTransition();
  const corInfo = getNotaCor(cor);

  function save(nextNotas: string, nextCor: NotaCorValue | null) {
    startTransition(async () => {
      try {
        await updatePlaylistSongNotes({
          playlistId: item.playlistId,
          songId: item.songId,
          notas: nextNotas,
          cor: nextCor,
        });
        toast.success("Observação salva");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar observação");
      }
    });
  }

  return (
    <div
      className={cn("flex flex-col gap-2 rounded-md border p-2", corInfo && "border-l-4", corInfo?.border)}
    >
      <div>
        <p className="text-sm font-medium">{item.song.titulo}</p>
        <p className="text-xs text-muted-foreground">{item.song.artista}</p>
      </div>
      <Textarea
        placeholder="Observações (ex: repetir refrão, ministrar)"
        value={notas}
        rows={1}
        onChange={(e) => setNotas(e.target.value)}
        onBlur={() => save(notas, cor)}
      />
      <NotaColorPicker
        value={cor}
        onChange={(next) => {
          setCor(next);
          save(notas, next);
        }}
      />
    </div>
  );
}

export function NotasAdminList({ items }: { items: NotaAdminItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma anotação cadastrada ainda.</p>;
  }

  const groups = new Map<string, { nome: string; data: Date; playlistId: string; items: NotaAdminItem[] }>();
  for (const item of items) {
    const key = item.playlistId;
    if (!groups.has(key)) {
      groups.set(key, { nome: item.playlist.nome, data: item.playlist.data, playlistId: key, items: [] });
    }
    groups.get(key)!.items.push(item);
  }

  return (
    <div className="flex flex-col gap-6">
      {Array.from(groups.values()).map((group) => (
        <div key={group.playlistId} className="flex flex-col gap-2">
          <Link href={`/playlists/${group.playlistId}`} className="text-sm font-semibold hover:underline">
            {group.nome} — {formatDate(group.data)}
          </Link>
          <div className="flex flex-col gap-2">
            {group.items.map((item) => (
              <NotaRow key={item.songId} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
