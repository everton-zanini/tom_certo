"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

// O repertório inteiro vem numa única resposta do servidor, então não há como medir
// o progresso real. A barra avança rápido no começo e desacelera perto de 90%,
// só completando quando a página de apresentação substitui este fallback.
export default function PerformLoading() {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => p + (90 - p) * 0.08);
    }, 200);
    return () => clearInterval(id);
  }, []);

  const slow = progress > 80;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Download className="size-8 animate-bounce text-primary" />
      <div className="space-y-1">
        <p className="text-lg font-semibold">Baixando repertório…</p>
        <p className="text-sm text-muted-foreground">
          {slow
            ? "Está demorando mais que o normal, aguarde mais um pouco."
            : "Depois disso as músicas trocam sem precisar de internet."}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Baixando repertório"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
