import { auth } from "@/lib/auth";
import { listPlaylists } from "@/services/playlist.actions";
import { listFavoriteSongs } from "@/services/favorite.actions";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { SongCard } from "@/components/song/SongCard";

export default async function DashboardPage() {
  const [session, { playlists }, favoriteSongs] = await Promise.all([
    auth(),
    listPlaylists({ upcoming: true }),
    listFavoriteSongs(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold">Olá, {session?.user?.name}</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Próximos repertórios</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
          {playlists.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">Nenhum repertório agendado.</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Favoritos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
          {favoriteSongs.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">
              Você ainda não favoritou nenhuma música.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
