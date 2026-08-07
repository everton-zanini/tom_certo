import { SongForm } from "@/components/song/SongForm";

export default function NewSongPage() {
  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <h1 className="mb-4 text-xl font-semibold">Nova música</h1>
      <SongForm />
    </div>
  );
}
