"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  removeSongFromPlaylist,
  reorderPlaylistSongs,
  updatePlaylistSongNotes,
} from "@/services/playlist.actions";
import { PlaylistSongPicker, type PickableSong } from "@/components/playlist/PlaylistSongPicker";
import { NotaColorPicker } from "@/components/playlist/NotaColorPicker";
import { getNotaCor, type NotaCorValue } from "@/lib/nota-colors";
import { cn } from "@/lib/utils";

export type PlaylistBuilderSong = {
  songId: string;
  titulo: string;
  artista: string | null;
  notas: string | null;
  cor: NotaCorValue | null;
};

function Row({
  item,
  isFirst,
  isLast,
  onMove,
  onRemove,
  onNoteChange,
}: {
  item: PlaylistBuilderSong;
  isFirst: boolean;
  isLast: boolean;
  onMove: (delta: number) => void;
  onRemove: () => void;
  onNoteChange: (notas: string, cor: NotaCorValue | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.songId });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [notas, setNotas] = useState(item.notas ?? "");
  const [cor, setCor] = useState<NotaCorValue | null>(item.cor);
  const corInfo = getNotaCor(cor);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("flex flex-col gap-2 rounded-md border p-2", corInfo && "border-l-4", corInfo?.border)}
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium">{item.titulo}</p>
          <p className="text-xs text-muted-foreground">{item.artista}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => onMove(-1)} disabled={isFirst} aria-label="Mover para cima">
          <ChevronUp className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => onMove(1)} disabled={isLast} aria-label="Mover para baixo">
          <ChevronDown className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Remover do repertório">
          <X className="size-4" />
        </Button>
      </div>
      <Textarea
        placeholder="Observações (ex: repetir refrão, ministrar)"
        value={notas}
        rows={1}
        onChange={(e) => setNotas(e.target.value)}
        onBlur={() => onNoteChange(notas, cor)}
      />
      <NotaColorPicker
        value={cor}
        onChange={(next) => {
          setCor(next);
          onNoteChange(notas, next);
        }}
      />
    </div>
  );
}

export function PlaylistBuilder({
  playlistId,
  initialSongs,
  availableSongs,
}: {
  playlistId: string;
  initialSongs: PlaylistBuilderSong[];
  availableSongs: PickableSong[];
}) {
  const [items, setItems] = useState(initialSongs);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => setItems(initialSongs), [initialSongs]);

  function persistOrder(next: PlaylistBuilderSong[]) {
    setItems(next);
    startTransition(async () => {
      try {
        await reorderPlaylistSongs(playlistId, next.map((i) => i.songId));
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao reordenar músicas");
      }
    });
  }

  function move(index: number, delta: number) {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    persistOrder(arrayMove(items, index, targetIndex));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.songId === active.id);
    const newIndex = items.findIndex((i) => i.songId === over.id);
    persistOrder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <div className="flex flex-col gap-4">
      <PlaylistSongPicker
        playlistId={playlistId}
        availableSongs={availableSongs.filter((s) => !items.some((i) => i.songId === s.id))}
        onAdded={() => router.refresh()}
      />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.songId)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <Row
                key={item.songId}
                item={item}
                isFirst={index === 0}
                isLast={index === items.length - 1}
                onMove={(delta) => move(index, delta)}
                onRemove={() => {
                  setItems((prev) => prev.filter((i) => i.songId !== item.songId));
                  startTransition(async () => {
                    try {
                      await removeSongFromPlaylist(playlistId, item.songId);
                      toast.success("Música removida do repertório");
                      router.refresh();
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Erro ao remover música");
                    }
                  });
                }}
                onNoteChange={(notas, cor) => {
                  startTransition(async () => {
                    try {
                      await updatePlaylistSongNotes({ playlistId, songId: item.songId, notas, cor });
                      toast.success("Observação salva");
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Erro ao salvar observação");
                    }
                  });
                }}
              />
            ))}
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma música no repertório ainda.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
