"use client";

import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyLinkButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado");
      }}
    >
      <Link2 className="size-4" />
      Copiar link
    </Button>
  );
}
