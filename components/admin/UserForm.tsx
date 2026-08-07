"use client";

import { useTransition } from "react";
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

const DEFAULT_PASSWORD = "trocar123";

const formSchema = createUserSchema.omit({ password: true });
type FormValues = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

export function UserForm() {
  const router = useRouter();
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
      try {
        await createUser({ ...values, password: DEFAULT_PASSWORD });
        toast.success(`Usuário criado com a senha padrão "${DEFAULT_PASSWORD}"`);
        reset();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao criar usuário");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-md border p-4">
      <h2 className="font-medium">Novo usuário</h2>
      <p className="text-sm text-muted-foreground">
        A senha inicial será <span className="font-mono">{DEFAULT_PASSWORD}</span>. Oriente o usuário a
        trocá-la em &quot;Minha conta&quot; após o primeiro login.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
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
  );
}
