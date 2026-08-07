import Link from "next/link";
import { listSongs } from "@/services/song.actions";
import { Button } from "@/components/ui/button";
import { DeleteSongButton } from "@/components/admin/DeleteSongButton";

export default async function AdminSongsPage() {
  const songs = await listSongs();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Músicas</h1>
        <Button size="sm" nativeButton={false} render={<Link href="/songs/new">Nova música</Link>} />
      </div>
      <div className="flex flex-col divide-y rounded-md border">
        {songs.map((song) => (
          <div key={song.id} className="flex items-center justify-between p-3">
            <div>
              <p className="font-medium">{song.titulo}</p>
              <p className="text-sm text-muted-foreground">{song.artista}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href={`/songs/${song.id}/edit`}>Editar</Link>}
              />
              <DeleteSongButton songId={song.id} />
            </div>
          </div>
        ))}
        {songs.length === 0 && <p className="p-3 text-sm text-muted-foreground">Nenhuma música cadastrada.</p>}
      </div>
    </div>
  );
}
