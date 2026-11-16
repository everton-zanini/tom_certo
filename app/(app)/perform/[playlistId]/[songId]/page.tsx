import { notFound } from "next/navigation";
import { getPerformPlaylistData } from "@/services/perform.actions";
import { SongViewer } from "@/components/song/SongViewer";

export default async function PerformPage({
  params,
}: {
  params: Promise<{ playlistId: string; songId: string }>;
}) {
  const { playlistId, songId } = await params;
  const songs = await getPerformPlaylistData(playlistId);
  const initialIndex = songs.findIndex((s) => s.song.id === songId);
  if (initialIndex < 0) notFound();
  const { song, lines, favorited } = songs[initialIndex];

  return (
    <SongViewer
      song={song}
      initialLines={lines}
      favorited={favorited}
      performNav={{ playlistId, songs, initialIndex }}
    />
  );
}
