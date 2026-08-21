import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPlaylist } from "@/services/playlist.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShareSheet } from "@/components/share/ShareSheet";
import { PublishPlaylistButton } from "@/components/playlist/PublishPlaylistButton";
import { getNotaCor } from "@/lib/nota-colors";
import { cn } from "@/lib/utils";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, playlist] = await Promise.all([auth(), getPlaylist(id)]);
  const isAdmin = session?.user?.role === "ADMIN";
  const firstSongId = playlist.songs[0]?.songId;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{playlist.nome}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(playlist.data)} {playlist.culto ? `— ${playlist.culto}` : ""}
          </p>
        </div>
        {playlist.visibility === "DRAFT" && <Badge variant="outline">Rascunho</Badge>}
      </div>

      {playlist.descricao && <p className="text-sm text-muted-foreground">{playlist.descricao}</p>}

      <div className="flex flex-wrap gap-2">
        {firstSongId && (
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/perform/${playlist.id}/${firstSongId}`}>Iniciar apresentação</Link>}
          />
        )}
        <ShareSheet playlistId={playlist.id} />
        {isAdmin && (
          <>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/playlists/${playlist.id}/edit`}>Editar</Link>}
            />
            {playlist.visibility === "DRAFT" && <PublishPlaylistButton playlistId={playlist.id} />}
          </>
        )}
      </div>

      <ol className="flex flex-col gap-2">
        {playlist.songs.map((ps, i) => {
          const corInfo = getNotaCor(ps.cor);
          return (
            <li key={ps.id}>
              <Link
                href={`/perform/${playlist.id}/${ps.songId}`}
                className={cn(
                  "flex flex-col rounded-md border p-3 hover:bg-accent",
                  corInfo && "border-l-4",
                  corInfo?.border
                )}
              >
                <span className="font-medium">
                  {i + 1}. {ps.song.titulo}
                </span>
                <span className="text-sm text-muted-foreground">{ps.song.artista}</span>
                {ps.notas && (
                  <span
                    className={cn(
                      "mt-1 flex items-center gap-1.5 text-sm italic",
                      corInfo ? corInfo.text : "text-muted-foreground"
                    )}
                  >
                    {corInfo && <span className={cn("inline-block size-2 rounded-full", corInfo.dot)} />}
                    {ps.notas}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        {playlist.songs.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma música neste repertório ainda.</p>
        )}
      </ol>
    </div>
  );
}
