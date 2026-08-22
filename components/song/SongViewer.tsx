"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
  performNav?: { prevHref: string | null; nextHref: string | null };
}) {
  const [fontSize, setFontSize] = useState(18);
  const [chordColor, setChordColor] = useState<NotaCorValue | null>(null);
  const [transposeSteps, setTransposeSteps] = useState(0);
  const [projectionMode, setProjectionMode] = useState(false);
  const [teleprompterPlaying, setTeleprompterPlaying] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(40);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayLines = useMemo(
    () => transposeLines(initialLines, transposeSteps),
    [initialLines, transposeSteps]
  );
  const displayKey = transposeChord(song.tomAtual, transposeSteps);

  useTeleprompter(containerRef, teleprompterSpeed, teleprompterPlaying);

  useEffect(() => {
    const stored = localStorage.getItem(CHORD_COLOR_STORAGE_KEY) as NotaCorValue | null;
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
        <div>
          <h1 className="text-lg font-semibold">{song.titulo}</h1>
          <p className="text-sm text-muted-foreground">{song.artista}</p>
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
          {song.linkYoutube && <YouTubeButton url={song.linkYoutube} />}
          <CopyLinkButton />
          <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
          <FavoriteButton songId={song.id} initialFavorited={favorited} />
        </div>
      </div>

      {performNav && (
        <div className="flex items-center justify-between border-b px-3 py-2">
          {performNav.prevHref ? (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={
                <Link href={performNav.prevHref}>
                  <ChevronLeft className="size-4" /> Anterior
                </Link>
              }
            />
          ) : (
            <Button variant="ghost" size="sm" disabled>
              <ChevronLeft className="size-4" /> Anterior
            </Button>
          )}
          {performNav.nextHref ? (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={
                <Link href={performNav.nextHref}>
                  Próxima <ChevronRight className="size-4" />
                </Link>
              }
            />
          ) : (
            <Button variant="ghost" size="sm" disabled>
              Próxima <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        onClick={() => setTeleprompterPlaying((p) => !p)}
        className="flex-1 overflow-y-auto bg-background p-4"
        style={{ ["--cifra-font-size" as string]: `${fontSize}px` }}
      >
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
              {performNav &&
                (performNav.prevHref ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    nativeButton={false}
                    aria-label="Música anterior"
                    render={
                      <Link href={performNav.prevHref}>
                        <ChevronLeft className="size-4" />
                      </Link>
                    }
                  />
                ) : (
                  <Button variant="ghost" size="icon" disabled aria-label="Música anterior">
                    <ChevronLeft className="size-4" />
                  </Button>
                ))}
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} aria-label="Sair da tela cheia">
                <Minimize className="size-4" />
              </Button>
              {performNav &&
                (performNav.nextHref ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    nativeButton={false}
                    aria-label="Próxima música"
                    render={
                      <Link href={performNav.nextHref}>
                        <ChevronRight className="size-4" />
                      </Link>
                    }
                  />
                ) : (
                  <Button variant="ghost" size="icon" disabled aria-label="Próxima música">
                    <ChevronRight className="size-4" />
                  </Button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
