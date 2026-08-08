import Link from "next/link";
import { auth } from "@/lib/auth";
import { listSongs } from "@/services/song.actions";
import { SongLibrary } from "@/components/song/SongLibrary";
import { Button } from "@/components/ui/button";

export default async function SongsPage() {
  const [session, songs] = await Promise.all([auth(), listSongs()]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between p-4 pb-0">
        <h1 className="text-xl font-semibold">Músicas</h1>
        {session?.user?.role === "ADMIN" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/songs/import">Importar</Link>}
            />
            <Button size="sm" nativeButton={false} render={<Link href="/songs/new">Nova música</Link>} />
          </div>
        )}
      </div>
      <SongLibrary songs={songs} />
    </div>
  );
}
