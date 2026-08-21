import { getPlaylist } from "@/services/playlist.actions";
import { listSongs } from "@/services/song.actions";
import { PlaylistForm } from "@/components/playlist/PlaylistForm";
import { PlaylistBuilder } from "@/components/playlist/PlaylistBuilder";

export default async function EditPlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [playlist, allSongs] = await Promise.all([getPlaylist(id), listSongs()]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-4">
      <div>
        <h1 className="mb-4 text-xl font-semibold">Editar repertório</h1>
        <PlaylistForm
          playlistId={playlist.id}
          defaultValues={{
            nome: playlist.nome,
            data: playlist.data,
            culto: playlist.culto ?? "",
            descricao: playlist.descricao ?? "",
          }}
        />
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold">Músicas</h2>
        <PlaylistBuilder
          playlistId={playlist.id}
          initialSongs={playlist.songs.map((ps) => ({
            songId: ps.songId,
            titulo: ps.song.titulo,
            artista: ps.song.artista,
            notas: ps.notas,
            cor: ps.cor,
          }))}
          availableSongs={allSongs.map((s) => ({ id: s.id, titulo: s.titulo, artista: s.artista }))}
        />
      </div>
    </div>
  );
}
