"use client";

import { useState, type RefObject } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FullscreenToggle({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  async function toggle() {
    if (!document.fullscreenEnabled || !targetRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      await targetRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle}>
      {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
      Tela cheia
    </Button>
  );
}
