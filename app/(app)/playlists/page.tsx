import Link from "next/link";
import { auth } from "@/lib/auth";
import { listPlaylists } from "@/services/playlist.actions";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { PlaylistDateFilter } from "@/components/playlist/PlaylistDateFilter";
import { PlaylistPagination } from "@/components/playlist/PlaylistPagination";
import { Button } from "@/components/ui/button";

export default async function PlaylistsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; date?: string }>;
}) {
  const { page: pageParam, date: dateParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const date = dateParam ? new Date(`${dateParam}T00:00:00`) : undefined;

  const [session, { playlists, totalPages }] = await Promise.all([
    auth(),
    listPlaylists({ page, date }),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Repertórios</h1>
        {session?.user?.role === "ADMIN" && (
          <Button size="sm" nativeButton={false} render={<Link href="/playlists/new">Novo repertório</Link>} />
        )}
      </div>
      <PlaylistDateFilter />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
        {playlists.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">Nenhum repertório encontrado.</p>
        )}
      </div>
      <PlaylistPagination page={page} totalPages={totalPages} date={dateParam} />
    </div>
  );
}
