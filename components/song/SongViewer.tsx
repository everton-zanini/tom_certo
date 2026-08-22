"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Minimize, Music, Presentation } from "lucide-react";
import { ChordSheet } from "@/components/song/ChordSheet";
import { TransposeControl } from "@/components/song/TransposeControl";
import { FontSizeControl } from "@/components/song/FontSizeControl";
import { TeleprompterControls, useTeleprompter } from "@/components/song/Teleprompter";
import { YouTubeButton } from "@/components/song/YouTubeButton";
import { FavoriteButton } from "@/components/song/FavoriteButton";
import { CopyLinkButton } from "@/components/song/CopyLinkButton";
import { FullscreenToggle } from "@/components/song/FullscreenToggle";
import { Button } from "@/components/ui/button";
import { transposeChord, transposeLines } from "@/lib/cifra/transpose";
import type { ParsedLine } from "@/lib/cifra/parser";
import { NotaColorPicker } from "@/components/playlist/NotaColorPicker";
import type { NotaCorValue } from "@/lib/nota-colors";
import { CHORD_COLOR_STORAGE_KEY, getChordColorClass } from "@/lib/chord-colors";
import { getPerformSongData } from "@/services/perform.actions";

export type SongViewerSong = {
  id: string;
  titulo: string;
  artista: string | null;
  tomAtual: string;
  linkYoutube: string | null;
};

export function SongViewer({
  song,
  initialLines,
  favorited,
  performNav,
}: {
  song: SongViewerSong;
  initialLines: ParsedLine[];
  favorited: boolean;
  performNav?: { playlistId: string; prevSongId: string | null; nextSongId: string | null };
}) {
  const [currentSong, setCurrentSong] = useState(song);
  const [currentLines, setCurrentLines] = useState(initialLines);
  const [currentFavorited, setCurrentFavorited] = useState(favorited);
  const [nav, setNav] = useState(performNav);
  const [isNavigating, setIsNavigating] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [chordColor, setChordColor] = useState<NotaCorValue | null>(null);
  const [transposeSteps, setTransposeSteps] = useState(0);
  const [projectionMode, setProjectionMode] = useState(false);
  const [teleprompterPlaying, setTeleprompterPlaying] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(40);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayLines = useMemo(
    () => transposeLines(currentLines, transposeSteps),
    [currentLines, transposeSteps]
  );
  const displayKey = transposeChord(currentSong.tomAtual, transposeSteps);

  useTeleprompter(containerRef, teleprompterSpeed, teleprompterPlaying);

  useEffect(() => {
    // Deferred to an effect (not a lazy useState initializer) because localStorage
    // is unavailable during SSR and reading it during the client's first render
    // would produce a hydration mismatch.
    const stored = localStorage.getItem(CHORD_COLOR_STORAGE_KEY) as NotaCorValue | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setChordColor(stored);
  }, []);

  function handleChordColorChange(next: NotaCorValue | null) {
    setChordColor(next);
    if (next) {
      localStorage.setItem(CHORD_COLOR_STORAGE_KEY, next);
    } else {
      localStorage.removeItem(CHORD_COLOR_STORAGE_KEY);
    }
  }

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (!document.fullscreenEnabled || !containerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
  }

  // Fetches the next/previous song client-side instead of navigating, so the
  // viewer never unmounts — a real route change would drop the fullscreen element
  // from the DOM and the browser auto-exits fullscreen.
  async function goToSong(songId: string) {
    if (!nav || isNavigating) return;
    setIsNavigating(true);
    try {
      const data = await getPerformSongData(nav.playlistId, songId);
      setCurrentSong(data.song);
      setCurrentLines(data.lines);
      setCurrentFavorited(data.favorited);
      setNav({ playlistId: nav.playlistId, prevSongId: data.prevSongId, nextSongId: data.nextSongId });
      setTransposeSteps(0);
      if (containerRef.current) containerRef.current.scrollTop = 0;
      window.history.replaceState(null, "", `/perform/${nav.playlistId}/${songId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar música");
    } finally {
      setIsNavigating(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
        <div>
          <h1 className="text-lg font-semibold">{currentSong.titulo}</h1>
          <p className="text-sm text-muted-foreground">{currentSong.artista}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={projectionMode ? "default" : "outline"}
            size="sm"
            onClick={() => setProjectionMode((p) => !p)}
          >
            {projectionMode ? <Music className="size-4" /> : <Presentation className="size-4" />}
            Projeção
          </Button>
          {!projectionMode && (
            <TransposeControl currentKey={displayKey} onChange={(d) => setTransposeSteps((s) => s + d)} />
          )}
          <FontSizeControl fontSize={fontSize} onChange={setFontSize} />
          {!projectionMode && (
            <div className="flex items-center gap-1.5 rounded-md border px-2 py-1">
              <span className="text-sm text-muted-foreground">Cor acordes</span>
              <NotaColorPicker value={chordColor} onChange={handleChordColorChange} />
            </div>
          )}
          <TeleprompterControls
            playing={teleprompterPlaying}
            onTogglePlaying={() => setTeleprompterPlaying((p) => !p)}
            speed={teleprompterSpeed}
            onSpeedChange={setTeleprompterSpeed}
          />
          {currentSong.linkYoutube && <YouTubeButton url={currentSong.linkYoutube} />}
          <CopyLinkButton />
          <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
          <FavoriteButton key={currentSong.id} songId={currentSong.id} initialFavorited={currentFavorited} />
        </div>
      </div>

      {nav && (
        <div className="flex items-center justify-between border-b px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!nav.prevSongId || isNavigating}
            onClick={() => nav.prevSongId && goToSong(nav.prevSongId)}
          >
            <ChevronLeft className="size-4" /> Anterior
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!nav.nextSongId || isNavigating}
            onClick={() => nav.nextSongId && goToSong(nav.nextSongId)}
          >
            Próxima <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <div
        ref={containerRef}
        onClick={() => setTeleprompterPlaying((p) => !p)}
        className="flex-1 overflow-y-auto bg-background p-4"
        style={{ ["--cifra-font-size" as string]: `${fontSize}px` }}
      >
        {isFullscreen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-x-0 top-0 z-50 bg-background/95 px-4 py-3 text-center shadow-sm backdrop-blur"
          >
            <p className="text-lg font-semibold">{currentSong.titulo}</p>
            {currentSong.artista && <p className="text-sm text-muted-foreground">{currentSong.artista}</p>}
          </div>
        )}

        <ChordSheet
          lines={displayLines}
          showChords={!projectionMode}
          chordColorClass={getChordColorClass(chordColor)}
        />

        {isFullscreen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-x-0 bottom-6 z-50 flex justify-center"
          >
            <div className="flex items-center gap-1 rounded-full border bg-background/95 p-1 shadow-lg backdrop-blur">
              {nav && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!nav.prevSongId || isNavigating}
                  aria-label="Música anterior"
                  onClick={() => nav.prevSongId && goToSong(nav.prevSongId)}
                >
                  <ChevronLeft className="size-4" /> Anterior
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={toggleFullscreen} aria-label="Sair da tela cheia">
                <Minimize className="size-4" /> Sair
              </Button>
              {nav && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!nav.nextSongId || isNavigating}
                  aria-label="Próxima música"
                  onClick={() => nav.nextSongId && goToSong(nav.nextSongId)}
                >
                  Próxima <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
