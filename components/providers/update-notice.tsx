import { RefreshCw } from "lucide-react";

export function UpdateNotice({ variant }: { variant: "updating" | "pending" }) {
  if (variant === "pending") {
    return (
      <div
        role="status"
        className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-sm rounded-lg border bg-card px-4 py-2 text-center text-sm shadow-lg"
      >
        Nova versão disponível. O app atualiza ao sair da apresentação.
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="update-title"
        aria-describedby="update-description"
        className="flex w-full max-w-xs flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-lg"
      >
        <RefreshCw className="size-6 text-primary motion-safe:animate-spin" aria-hidden />
        <h2 id="update-title" className="font-semibold">
          Atualizando o app
        </h2>
        <p id="update-description" className="text-sm text-muted-foreground">
          Uma nova versão está disponível. A tela vai recarregar em instantes.
        </p>
      </div>
    </div>
  );
}
