import { getSong } from "@/services/song.actions";
import { SongForm } from "@/components/song/SongForm";

export default async function EditSongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const song = await getSong(id);

  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <h1 className="mb-4 text-xl font-semibold">Editar música</h1>
      <SongForm
        songId={song.id}
        defaultValues={{
          titulo: song.titulo,
          artista: song.artista ?? "",
          ministerio: song.ministerio ?? "",
          tomOriginal: song.tomOriginal,
          tomAtual: song.tomAtual,
          capo: song.capo ?? undefined,
          bpm: song.bpm ?? undefined,
          genero: song.genero ?? "",
          observacoes: song.observacoes ?? "",
          linkYoutube: song.linkYoutube ?? "",
          cifra: song.cifra,
          tags: song.tags.map((t) => t.tag.nome),
        }}
      />
    </div>
  );
}
