"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SongCard, type SongCardData } from "@/components/song/SongCard";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function SongLibrary({ songs }: { songs: SongCardData[] }) {
  const [query, setQuery] = useState("");
  const [artista, setArtista] = useState<string>("all");
  const deferredQuery = useDeferredValue(query);

  const artistas = useMemo(
    () => Array.from(new Set(songs.map((s) => s.artista).filter(Boolean))) as string[],
    [songs]
  );

  const filtered = useMemo(() => {
    const q = normalize(deferredQuery);
    return songs.filter((song) => {
      if (artista !== "all" && song.artista !== artista) return false;
      if (!q) return true;
      return (
        normalize(song.titulo).includes(q) ||
        (song.artista ? normalize(song.artista).includes(q) : false) ||
        song.tags.some(({ tag }) => normalize(tag.nome).includes(q))
      );
    });
  }, [songs, deferredQuery, artista]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Buscar por título, artista ou tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-sm"
        />
        <Select value={artista} onValueChange={(value) => setArtista(value ?? "all")}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Artista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os artistas</SelectItem>
            {artistas.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">Nenhuma música encontrada.</p>
        )}
      </div>
    </div>
  );
}
