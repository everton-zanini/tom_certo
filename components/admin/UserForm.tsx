"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { z } from "zod";
import { createUserSchema } from "@/types/schemas/user.schema";
import { createUser } from "@/services/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLoadingOverlay } from "@/components/providers/loading-overlay-provider";

const DEFAULT_PASSWORD = "trocar123";

const formSchema = createUserSchema.omit({ password: true });
type FormValues = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

export function UserForm() {
  const router = useRouter();
  const { runWithOverlay } = useLoadingOverlay();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", role: "MEMBRO" },
  });

  function onSubmit(values: FormOutput) {
    startTransition(async () => {
      await runWithOverlay(async () => {
        try {
          await createUser({ ...values, password: DEFAULT_PASSWORD });
          toast.success(`Usuário criado com a senha padrão "${DEFAULT_PASSWORD}"`);
          reset();
          setOpen(false);
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao criar usuário");
        }
      }, "Criando...");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)} className="self-start">
        Novo usuário
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            A senha inicial será <span className="font-mono">{DEFAULT_PASSWORD}</span>. Oriente o usuário a
            trocá-la em &quot;Minha conta&quot; após o primeiro login.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Papel</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(value) => field.onChange(value ?? "MEMBRO")}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBRO">Membro</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="self-start">
            {isPending ? "Criando..." : "Criar usuário"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
