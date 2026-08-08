"use client";

import { useState } from "react";
import { toast } from "sonner";
import { parseImportedSongText, type ImportedSong } from "@/lib/cifra/import";
import { SongForm } from "@/components/song/SongForm";

export function ImportSongForm() {
  const [imported, setImported] = useState<ImportedSong | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    try {
      const text = await file.text();
      const fallbackTitulo = file.name.replace(/\.[^.]+$/, "");
      setImported(parseImportedSongText(text, fallbackTitulo));
      setFileName(file.name);
    } catch {
      toast.error("Não foi possível ler o arquivo");
    }
  }

  if (imported) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
          <span>
            Importado de <strong>{fileName}</strong> — revise os campos antes de salvar.
          </span>
          <button
            type="button"
            className="text-muted-foreground underline"
            onClick={() => {
              setImported(null);
              setFileName(null);
            }}
          >
            Trocar arquivo
          </button>
        </div>
        <SongForm defaultValues={imported} />
      </div>
    );
  }

  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-10 text-center hover:bg-muted">
      <span className="font-medium">Toque para escolher o arquivo .txt</span>
      <span className="text-sm text-muted-foreground">
        Selecione o arquivo de cifra exportado do seu outro programa
      </span>
      <input
        type="file"
        accept=".txt,text/plain"
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
