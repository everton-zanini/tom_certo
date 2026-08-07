"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { songSchema, type SongInput } from "@/types/schemas/song.schema";
import { createSong, updateSong } from "@/services/song.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formSchema = songSchema
  .omit({ tags: true, capo: true, bpm: true })
  .extend({
    capo: z.number().int().min(0).max(11).optional(),
    bpm: z.number().int().min(20).max(300).optional(),
    tagsInput: z.string().optional(),
  });
type SongFormValues = z.infer<typeof formSchema>;

export function SongForm({
  songId,
  defaultValues,
}: {
  songId?: string;
  defaultValues?: Partial<SongInput>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SongFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: defaultValues?.titulo ?? "",
      artista: defaultValues?.artista ?? "",
      ministerio: defaultValues?.ministerio ?? "",
      tomOriginal: defaultValues?.tomOriginal ?? "",
      tomAtual: defaultValues?.tomAtual ?? "",
      capo: defaultValues?.capo,
      bpm: defaultValues?.bpm,
      genero: defaultValues?.genero ?? "",
      observacoes: defaultValues?.observacoes ?? "",
      linkYoutube: defaultValues?.linkYoutube ?? "",
      cifra: defaultValues?.cifra ?? "",
      tagsInput: defaultValues?.tags?.join(", ") ?? "",
    },
  });

  function onSubmit(values: SongFormValues) {
    const { tagsInput, ...rest } = values;
    const payload: SongInput = {
      ...rest,
      tags: (tagsInput ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    startTransition(async () => {
      try {
        const song = songId ? await updateSong(songId, payload) : await createSong(payload);
        toast.success("Música salva");
        router.push(`/songs/${song.id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar música");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" {...register("titulo")} />
          {errors.titulo && <p className="text-sm text-destructive">{errors.titulo.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="artista">Artista</Label>
          <Input id="artista" {...register("artista")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ministerio">Ministério</Label>
          <Input id="ministerio" {...register("ministerio")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="genero">Gênero</Label>
          <Input id="genero" {...register("genero")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tomOriginal">Tom original</Label>
          <Input id="tomOriginal" placeholder="G" {...register("tomOriginal")} />
          {errors.tomOriginal && <p className="text-sm text-destructive">{errors.tomOriginal.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tomAtual">Tom atual (opcional)</Label>
          <Input id="tomAtual" placeholder="Igual ao original" {...register("tomAtual")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="capo">Capotraste</Label>
          <Input id="capo" type="number" {...register("capo", { valueAsNumber: true })} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="bpm">BPM</Label>
          <Input id="bpm" type="number" {...register("bpm", { valueAsNumber: true })} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="linkYoutube">Link do YouTube</Label>
          <Input id="linkYoutube" placeholder="https://youtu.be/..." {...register("linkYoutube")} />
          {errors.linkYoutube && <p className="text-sm text-destructive">{errors.linkYoutube.message}</p>}
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="tagsInput">Tags (separadas por vírgula)</Label>
          <Input id="tagsInput" placeholder="louvor, adoração, jovens" {...register("tagsInput")} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea id="observacoes" rows={3} {...register("observacoes")} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="cifra">Cifra (cole o texto com acordes acima da letra)</Label>
          <Textarea id="cifra" rows={16} className="font-mono" {...register("cifra")} />
          {errors.cifra && <p className="text-sm text-destructive">{errors.cifra.message}</p>}
        </div>
      </div>
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Salvando..." : "Salvar música"}
      </Button>
    </form>
  );
}
