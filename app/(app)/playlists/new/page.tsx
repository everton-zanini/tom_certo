import { PlaylistForm } from "@/components/playlist/PlaylistForm";

export default function NewPlaylistPage() {
  return (
    <div className="mx-auto w-full max-w-xl p-4">
      <h1 className="mb-4 text-xl font-semibold">Novo repertório</h1>
      <PlaylistForm />
    </div>
  );
}
