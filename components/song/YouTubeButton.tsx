"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function toEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
}

export function YouTubeButton({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const embedUrl = toEmbedUrl(url);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Video className="size-4" />
        Vídeo
      </Button>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vídeo</DialogTitle>
        </DialogHeader>
        {open && embedUrl ? (
          <div className="aspect-video w-full overflow-hidden rounded-md">
            <iframe
              src={embedUrl}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm underline">
            Abrir no YouTube
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
}
