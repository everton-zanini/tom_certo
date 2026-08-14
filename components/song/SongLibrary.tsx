"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SongCard, type SongCardData } from "@/components/song/SongCard";
import { listSongsPage } from "@/services/song.actions";

const SEARCH_DEBOUNCE_MS = 300;

export function SongLibrary({
  initialSongs,
  initialHasMore,
  artistas,
}: {
  initialSongs: SongCardData[];
  initialHasMore: boolean;
  artistas: string[];
}) {
  const [query, setQuery] = useState("");
  const [artista, setArtista] = useState("all");
  const [songs, setSongs] = useState(initialSongs);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const requestId = ++requestIdRef.current;
    setIsSearching(true);
    const timeout = setTimeout(() => {
      listSongsPage({ page: 1, query, artista: artista === "all" ? undefined : artista }).then((result) => {
        if (requestId !== requestIdRef.current) return;
        setSongs(result.songs);
        setHasMore(result.hasMore);
        setPage(1);
        setIsSearching(false);
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query, artista]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    const requestId = requestIdRef.current;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    listSongsPage({ page: nextPage, query, artista: artista === "all" ? undefined : artista }).then((result) => {
      if (requestId !== requestIdRef.current) return;
      setSongs((prev) => [...prev, ...result.songs]);
      setHasMore(result.hasMore);
      setPage(nextPage);
      setIsLoadingMore(false);
    });
  }, [isLoadingMore, hasMore, page, query, artista]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Input
            placeholder="Buscar por título, artista ou letra..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <Loader2 className="absolute top-1/2 right-2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
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
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
        {songs.length === 0 && !isSearching && (
          <p className="col-span-full text-sm text-muted-foreground">Nenhuma música encontrada.</p>
        )}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          {isLoadingMore && (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Carregando mais...</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
