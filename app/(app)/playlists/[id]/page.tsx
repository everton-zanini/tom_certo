import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPlaylist, publishPlaylist } from "@/services/playlist.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShareSheet } from "@/components/share/ShareSheet";

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
            {playlist.visibility === "DRAFT" && (
              <form action={async () => { "use server"; await publishPlaylist(playlist.id); }}>
                <Button type="submit" variant="outline" size="sm">
                  Publicar
                </Button>
              </form>
            )}
          </>
        )}
      </div>

      <ol className="flex flex-col gap-2">
        {playlist.songs.map((ps, i) => (
          <li key={ps.id}>
            <Link
              href={`/perform/${playlist.id}/${ps.songId}`}
              className="flex flex-col rounded-md border p-3 hover:bg-accent"
            >
              <span className="font-medium">
                {i + 1}. {ps.song.titulo}
              </span>
              <span className="text-sm text-muted-foreground">{ps.song.artista}</span>
              {ps.notas && <span className="mt-1 text-sm italic text-muted-foreground">{ps.notas}</span>}
            </Link>
          </li>
        ))}
        {playlist.songs.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma música neste repertório ainda.</p>
        )}
      </ol>
    </div>
  );
}
