import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export type SongCardData = {
  id: string;
  titulo: string;
  artista: string | null;
  tomAtual: string;
  tags: { tag: { nome: string } }[];
};

export function SongCard({ song }: { song: SongCardData }) {
  return (
    <Link
      href={`/songs/${song.id}`}
      className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
    >
      <span
        aria-label={`Tom ${song.tomAtual}`}
        className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-lg font-bold text-primary"
      >
        {song.tomAtual}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-semibold">{song.titulo}</span>
        {song.artista && <span className="truncate text-sm text-muted-foreground">{song.artista}</span>}
        {song.tags.length > 0 && (
          <span className="mt-1.5 flex flex-wrap gap-1">
            {song.tags.slice(0, 3).map(({ tag }) => (
              <Badge key={tag.nome} variant="outline">
                {tag.nome}
              </Badge>
            ))}
          </span>
        )}
      </span>
    </Link>
  );
}
