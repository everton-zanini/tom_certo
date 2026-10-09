"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Minimize, Music, Pause, Play, Presentation, SlidersHorizontal } from "lucide-react";
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

const FONT_SIZE_STORAGE_KEY = "tomcerto:fontSize";
const SPEED_STORAGE_KEY = "tomcerto:teleprompterSpeed";
const PROJECTION_STORAGE_KEY = "tomcerto:projection";

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
  const [showMore, setShowMore] = useState(false);
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
    const storedSize = Number(localStorage.getItem(FONT_SIZE_STORAGE_KEY));
    if (storedSize >= 12 && storedSize <= 40) setFontSize(storedSize);
    const storedSpeed = Number(localStorage.getItem(SPEED_STORAGE_KEY));
    if (storedSpeed >= 10 && storedSpeed <= 200) setTeleprompterSpeed(storedSpeed);
    if (localStorage.getItem(PROJECTION_STORAGE_KEY) === "1") setProjectionMode(true);
  }, []);

  function handleFontSizeChange(next: number) {
    setFontSize(next);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(next));
  }

  function handleSpeedChange(next: number) {
    setTeleprompterSpeed(next);
    localStorage.setItem(SPEED_STORAGE_KEY, String(next));
  }

  function handleProjectionToggle() {
    const next = !projectionMode;
    setProjectionMode(next);
    localStorage.setItem(PROJECTION_STORAGE_KEY, next ? "1" : "0");
  }

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
      <div className="border-b bg-background">
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <span
            aria-label={`Tom ${displayKey}`}
            className="flex min-w-14 items-center justify-center rounded-lg bg-primary px-2 py-1.5 text-3xl leading-none font-bold text-primary-foreground"
          >
            {displayKey}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl leading-tight font-bold">{currentSong.titulo}</h1>
            {currentSong.artista && (
              <p className="truncate text-sm text-muted-foreground">{currentSong.artista}</p>
            )}
          </div>
          <FavoriteButton key={currentSong.id} songId={currentSong.id} initialFavorited={currentFavorited} />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto px-4 pb-2.5">
          {!projectionMode && (
            <TransposeControl currentKey={displayKey} onChange={(d) => setTransposeSteps((s) => s + d)} />
          )}
          <FontSizeControl fontSize={fontSize} onChange={handleFontSizeChange} />
          <Button
            variant={teleprompterPlaying ? "default" : "outline"}
            size="sm"
            onClick={() => setTeleprompterPlaying((p) => !p)}
            className={teleprompterPlaying ? "bg-stage text-stage-foreground hover:bg-stage/85" : undefined}
          >
            {teleprompterPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            Rolagem
          </Button>
          <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
          <Button
            variant={showMore ? "secondary" : "outline"}
            size="sm"
            aria-expanded={showMore}
            onClick={() => setShowMore((v) => !v)}
          >
            <SlidersHorizontal className="size-4" />
            Mais
          </Button>
        </div>
        {showMore && (
          <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2.5">
            <Button variant={projectionMode ? "default" : "outline"} size="sm" onClick={handleProjectionToggle}>
              {projectionMode ? <Music className="size-4" /> : <Presentation className="size-4" />}
              Projeção
            </Button>
            {!projectionMode && (
              <div className="flex items-center gap-1.5 rounded-md border px-2 py-1">
                <span className="text-sm text-muted-foreground">Cor dos acordes</span>
                <NotaColorPicker value={chordColor} onChange={handleChordColorChange} />
              </div>
            )}
            <TeleprompterControls
              playing={teleprompterPlaying}
              onTogglePlaying={() => setTeleprompterPlaying((p) => !p)}
              speed={teleprompterSpeed}
              onSpeedChange={handleSpeedChange}
            />
            {currentSong.linkYoutube && <YouTubeButton url={currentSong.linkYoutube} />}
            <CopyLinkButton />
          </div>
        )}
      </div>

      {nav && (
        <div className="flex items-center justify-between border-b px-3 py-1.5">
          <Button
            variant="ghost"
            disabled={!nav.prevSongId || isNavigating}
            onClick={() => nav.prevSongId && goToSong(nav.prevSongId)}
          >
            <ChevronLeft className="size-4" /> Anterior
          </Button>
          <Button
            variant="ghost"
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
        className="flex-1 overflow-y-auto bg-background p-4 pb-24"
        style={{ ["--cifra-font-size" as string]: `${fontSize}px` }}
      >
        {isFullscreen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="pt-safe fixed inset-x-0 top-0 z-50 border-b bg-background/95 px-4 py-3 text-center backdrop-blur"
          >
            <p className="text-lg font-bold">{currentSong.titulo}<span className="ml-2 text-primary">{displayKey}</span></p>
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
            className="pb-safe fixed inset-x-0 bottom-6 z-50 flex justify-center"
          >
            <div className="flex items-center gap-1 rounded-full border border-stage/50 bg-background/95 p-1 shadow-lg backdrop-blur">
              {nav && (
                <Button
                  variant="ghost"
                  disabled={!nav.prevSongId || isNavigating}
                  aria-label="Música anterior"
                  onClick={() => nav.prevSongId && goToSong(nav.prevSongId)}
                >
                  <ChevronLeft className="size-4" /> Anterior
                </Button>
              )}
              <Button variant="ghost" onClick={toggleFullscreen} aria-label="Sair da tela cheia" className="text-stage">
                <Minimize className="size-4" /> Sair
              </Button>
              {nav && (
                <Button
                  variant="ghost"
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
