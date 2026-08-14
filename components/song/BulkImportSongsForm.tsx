"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { bulkImportSongsFromZip, type BulkImportResult } from "@/services/song.actions";
import { Button } from "@/components/ui/button";
import { useLoadingOverlay } from "@/components/providers/loading-overlay-provider";

export function BulkImportSongsForm() {
  const { runWithOverlay } = useLoadingOverlay();
  const [, startTransition] = useTransition();
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFile(file: File) {
    setFileName(file.name);
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      await runWithOverlay(async () => {
        try {
          const outcome = await bulkImportSongsFromZip(formData);
          setResult(outcome);
          if (outcome.imported > 0) {
            toast.success(`${outcome.imported} música(s) importada(s)`);
          } else {
            toast.error("Nenhuma música nova foi importada");
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Não foi possível importar o arquivo");
        }
      }, `Importando ${file.name}...`);
    });
  }

  if (result) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">
            {result.imported} música(s) importada(s) de <strong>{fileName}</strong>
          </p>
          {result.skipped.length > 0 && (
            <div className="mt-3 flex flex-col gap-1">
              <p className="text-muted-foreground">{result.skipped.length} arquivo(s) não importado(s):</p>
              <ul className="max-h-64 list-disc overflow-y-auto pl-5 text-muted-foreground">
                {result.skipped.map((item, i) => (
                  <li key={i}>
                    {item.arquivo} — {item.motivo}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => {
            setResult(null);
            setFileName(null);
          }}
        >
          Importar outro arquivo
        </Button>
      </div>
    );
  }

  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-10 text-center hover:bg-muted">
      <span className="font-medium">Toque para escolher o arquivo .zip</span>
      <span className="text-sm text-muted-foreground">
        Selecione o backup com as cifras (.cfs) exportadas do seu outro programa
      </span>
      <input
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}
