"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [transposeSteps, setTransposeSteps] = useState(0);
  const [teleprompterPlaying, setTeleprompterPlaying] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(40);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayLines = useMemo(
    () => transposeLines(initialLines, transposeSteps),
    [initialLines, transposeSteps]
  );
  const displayKey = transposeChord(song.tomAtual, transposeSteps);

  useTeleprompter(containerRef, teleprompterSpeed, teleprompterPlaying);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
        <div>
          <h1 className="text-lg font-semibold">{song.titulo}</h1>
          <p className="text-sm text-muted-foreground">{song.artista}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TransposeControl currentKey={displayKey} onChange={(d) => setTransposeSteps((s) => s + d)} />
          <FontSizeControl fontSize={fontSize} onChange={setFontSize} />
          <TeleprompterControls
            playing={teleprompterPlaying}
            onTogglePlaying={() => setTeleprompterPlaying((p) => !p)}
            speed={teleprompterSpeed}
            onSpeedChange={setTeleprompterSpeed}
          />
          {song.linkYoutube && <YouTubeButton url={song.linkYoutube} />}
          <CopyLinkButton />
          <FullscreenToggle targetRef={containerRef} />
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
        <ChordSheet lines={displayLines} />
      </div>
    </div>
  );
}
