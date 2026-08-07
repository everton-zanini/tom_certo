import Link from "next/link";
import { auth } from "@/lib/auth";
import { getSongDisplayLines } from "@/services/song.actions";
import { isFavorited } from "@/services/favorite.actions";
import { SongViewer } from "@/components/song/SongViewer";
import { Button } from "@/components/ui/button";

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, { song, lines }, favorited] = await Promise.all([
    auth(),
    getSongDisplayLines(id),
    isFavorited(id),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      {session?.user?.role === "ADMIN" && (
        <div className="flex justify-end p-2">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/songs/${id}/edit`}>Editar</Link>} />
        </div>
      )}
      <SongViewer song={song} initialLines={lines} favorited={favorited} />
    </div>
  );
}
