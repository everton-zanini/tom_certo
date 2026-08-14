"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { playlistSchema, type PlaylistInput } from "@/types/schemas/playlist.schema";
import { createPlaylist, updatePlaylist } from "@/services/playlist.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLoadingOverlay } from "@/components/providers/loading-overlay-provider";

function toDateInputValue(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(date?: Date): string {
  if (!date) return "19:00";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function combineDateTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr || "00:00"}:00`);
}

const formSchema = playlistSchema
  .omit({ data: true })
  .extend({ data: z.string().min(1, "Data é obrigatória"), horario: z.string().optional() });
type FormValues = z.infer<typeof formSchema>;

export function PlaylistForm({
  playlistId,
  defaultValues,
}: {
  playlistId?: string;
  defaultValues?: Partial<PlaylistInput>;
}) {
  const router = useRouter();
  const { runWithOverlay } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: defaultValues?.nome ?? "",
      data: toDateInputValue(defaultValues?.data),
      horario: toTimeInputValue(defaultValues?.data),
      culto: defaultValues?.culto ?? "",
      descricao: defaultValues?.descricao ?? "",
    },
  });

  function onSubmit(values: FormValues) {
    const { data, horario, ...rest } = values;
    const payload: PlaylistInput = { ...rest, data: combineDateTime(data, horario ?? "00:00") };

    startTransition(async () => {
      await runWithOverlay(async () => {
        try {
          const playlist = playlistId
            ? await updatePlaylist(playlistId, payload)
            : await createPlaylist(payload);
          toast.success("Repertório salvo");
          router.push(`/playlists/${playlist.id}/edit`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao salvar repertório");
        }
      }, "Salvando...");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" {...register("nome")} />
        {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="data">Data</Label>
          <Input id="data" type="date" {...register("data")} />
          {errors.data && <p className="text-sm text-destructive">{errors.data.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="horario">Horário</Label>
          <Input id="horario" type="time" {...register("horario")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="culto">Culto</Label>
          <Input id="culto" placeholder="Culto de domingo, ensaio..." {...register("culto")} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" rows={3} {...register("descricao")} />
      </div>
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Salvando..." : "Salvar repertório"}
      </Button>
    </form>
  );
}
