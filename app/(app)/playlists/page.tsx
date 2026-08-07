import Link from "next/link";
import { auth } from "@/lib/auth";
import { listPlaylists } from "@/services/playlist.actions";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { Button } from "@/components/ui/button";

export default async function PlaylistsPage() {
  const [session, playlists] = await Promise.all([auth(), listPlaylists()]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Repertórios</h1>
        {session?.user?.role === "ADMIN" && (
          <Button size="sm" nativeButton={false} render={<Link href="/playlists/new">Novo repertório</Link>} />
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
        {playlists.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">Nenhum repertório disponível.</p>
        )}
      </div>
    </div>
  );
}
