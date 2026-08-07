"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FontSizeControl({
  fontSize,
  onChange,
}: {
  fontSize: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border px-2 py-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => onChange(Math.max(12, fontSize - 2))}
        aria-label="Diminuir fonte"
      >
        <Minus className="size-4" />
      </Button>
      <span className="min-w-[3ch] text-center text-sm font-medium">A</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => onChange(Math.min(40, fontSize + 2))}
        aria-label="Aumentar fonte"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
