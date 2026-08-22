import { getPerformSongData } from "@/services/perform.actions";
import { SongViewer } from "@/components/song/SongViewer";

export default async function PerformPage({
  params,
}: {
  params: Promise<{ playlistId: string; songId: string }>;
}) {
  const { playlistId, songId } = await params;
  const { song, lines, favorited, prevSongId, nextSongId } = await getPerformSongData(playlistId, songId);

  return (
    <SongViewer
      song={song}
      initialLines={lines}
      favorited={favorited}
      performNav={{ playlistId, prevSongId, nextSongId }}
    />
  );
}
