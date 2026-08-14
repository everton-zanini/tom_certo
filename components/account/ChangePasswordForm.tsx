"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { changePasswordSchema } from "@/types/schemas/user.schema";
import { changeOwnPassword } from "@/services/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoadingOverlay } from "@/components/providers/loading-overlay-provider";

const formSchema = changePasswordSchema
  .extend({ confirmPassword: z.string().min(1, "Confirme a nova senha") })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof formSchema>;

export function ChangePasswordForm() {
  const { runWithOverlay } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      await runWithOverlay(async () => {
        try {
          await changeOwnPassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          });
          toast.success("Senha alterada com sucesso");
          reset();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao alterar senha");
        }
      }, "Salvando...");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">Senha atual</Label>
        <Input id="currentPassword" type="password" {...register("currentPassword")} />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">Nova senha</Label>
        <Input id="newPassword" type="password" {...register("newPassword")} />
        {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Salvando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
