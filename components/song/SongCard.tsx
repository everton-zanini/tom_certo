import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
    <Link href={`/songs/${song.id}`}>
      <Card className="h-full transition-colors hover:bg-accent">
        <CardContent className="flex flex-col gap-1">
          <span className="font-medium">{song.titulo}</span>
          <span className="text-sm text-muted-foreground">{song.artista}</span>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <Badge variant="secondary">Tom: {song.tomAtual}</Badge>
            {song.tags.slice(0, 3).map(({ tag }) => (
              <Badge key={tag.nome} variant="outline">
                {tag.nome}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
