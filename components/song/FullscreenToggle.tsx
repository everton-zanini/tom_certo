"use client";

import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FullscreenToggle({
  isFullscreen,
  onToggle,
}: {
  isFullscreen: boolean;
  onToggle: () => void;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onToggle}>
      {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
      Tela cheia
    </Button>
  );
}
