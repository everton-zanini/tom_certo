"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NOTA_CORES, type NotaCorValue } from "@/lib/nota-colors";

export function NotaColorPicker({
  value,
  onChange,
}: {
  value: NotaCorValue | null;
  onChange: (cor: NotaCorValue | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-label="Sem cor"
        aria-pressed={value === null}
        className={cn(
          "flex size-5 items-center justify-center rounded-full border text-muted-foreground",
          value === null && "ring-2 ring-foreground ring-offset-1"
        )}
      >
        <X className="size-3" />
      </button>
      {NOTA_CORES.map((cor) => (
        <button
          key={cor.value}
          type="button"
          onClick={() => onChange(cor.value)}
          aria-label={cor.label}
          aria-pressed={value === cor.value}
          className={cn(
            "size-5 rounded-full",
            cor.dot,
            value === cor.value && "ring-2 ring-foreground ring-offset-1"
          )}
        />
      ))}
    </div>
  );
}
