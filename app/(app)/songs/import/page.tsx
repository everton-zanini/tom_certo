import { ImportSongForm } from "@/components/song/ImportSongForm";

export default function ImportSongPage() {
  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <h1 className="mb-4 text-xl font-semibold">Importar música</h1>
      <ImportSongForm />
    </div>
  );
}
