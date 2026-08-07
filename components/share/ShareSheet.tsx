"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { buildWhatsAppUrl } from "@/lib/share/build-message";
import { generateWhatsAppShareText } from "@/services/playlist.actions";

async function copy(text: string, label: string) {
  await navigator.clipboard.writeText(text);
  toast.success(`${label} copiado(s)`);
}

export function ShareSheet({ playlistId }: { playlistId: string }) {
  const [texts, setTexts] = useState<{ mensagem: string; apenasNomes: string; apenasLinks: string } | null>(
    null
  );

  return (
    <Drawer onOpenChange={(open) => open && !texts && generateWhatsAppShareText(playlistId).then(setTexts)}>
      <DrawerTrigger
        render={
          <Button variant="outline" size="sm">
            <Share2 className="size-4" />
            Compartilhar
          </Button>
        }
      />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Compartilhar repertório</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4 pb-6">
          <a
            href={texts ? buildWhatsAppUrl(texts.mensagem) : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full" disabled={!texts}>
              Compartilhar no WhatsApp
            </Button>
          </a>
          <Button variant="outline" disabled={!texts} onClick={() => texts && copy(texts.mensagem, "Mensagem")}>
            <Copy className="size-4" />
            Copiar mensagem
          </Button>
          <Button variant="outline" disabled={!texts} onClick={() => texts && copy(texts.apenasNomes, "Nomes")}>
            <Copy className="size-4" />
            Copiar apenas nomes
          </Button>
          <Button variant="outline" disabled={!texts} onClick={() => texts && copy(texts.apenasLinks, "Links")}>
            <Copy className="size-4" />
            Copiar apenas links
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
