import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type PlaylistCardData = {
  id: string;
  nome: string;
  data: Date;
  culto: string | null;
  visibility: "DRAFT" | "PUBLISHED";
  _count: { songs: number };
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function PlaylistCard({ playlist }: { playlist: PlaylistCardData }) {
  return (
    <Link href={`/playlists/${playlist.id}`}>
      <Card className="h-full transition-colors hover:bg-accent">
        <CardContent className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{playlist.nome}</span>
            {playlist.visibility === "DRAFT" && <Badge variant="outline">Rascunho</Badge>}
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDate(playlist.data)} {playlist.culto ? `— ${playlist.culto}` : ""}
          </span>
          <span className="text-xs text-muted-foreground">{playlist._count.songs} música(s)</span>
        </CardContent>
      </Card>
    </Link>
  );
}
