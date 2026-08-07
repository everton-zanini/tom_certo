import { getPlaylist } from "@/services/playlist.actions";
import { getSongDisplayLines } from "@/services/song.actions";
import { isFavorited } from "@/services/favorite.actions";
import { SongViewer } from "@/components/song/SongViewer";

export default async function PerformPage({
  params,
}: {
  params: Promise<{ playlistId: string; songId: string }>;
}) {
  const { playlistId, songId } = await params;
  const [playlist, { song, lines }, favorited] = await Promise.all([
    getPlaylist(playlistId),
    getSongDisplayLines(songId),
    isFavorited(songId),
  ]);

  const index = playlist.songs.findIndex((ps) => ps.songId === songId);
  const prevSongId = index > 0 ? playlist.songs[index - 1].songId : null;
  const nextSongId = index >= 0 && index < playlist.songs.length - 1 ? playlist.songs[index + 1].songId : null;

  return (
    <SongViewer
      song={song}
      initialLines={lines}
      favorited={favorited}
      performNav={{
        prevHref: prevSongId ? `/perform/${playlistId}/${prevSongId}` : null,
        nextHref: nextSongId ? `/perform/${playlistId}/${nextSongId}` : null,
      }}
    />
  );
}
