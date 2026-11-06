"use client";

import { useState } from "react";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChordSheet } from "@/components/song/ChordSheet";
import { BLOCK_DEFS, parseCifra } from "@/lib/cifra/parser";

const CHORDS_EXAMPLE = "G       D\nGrande é o Senhor";
const OBSERVACAO_EXAMPLE = "> Repetir com calma";

export function CifraHelpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Ajuda sobre a cifra"
        onClick={() => setOpen(true)}
      >
        <CircleHelp className="size-4" />
      </Button>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Como escrever a cifra</DialogTitle>
        </DialogHeader>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Acordes</h3>
          <p className="text-sm text-muted-foreground">
            Cole o texto com a linha de acordes logo acima da linha da letra.
          </p>
          <pre className="rounded-md bg-muted px-3 py-2 text-sm">{CHORDS_EXAMPLE}</pre>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Observação</h3>
          <p className="text-sm text-muted-foreground">
            Para uma instrução ao músico (ex: &ldquo;repetir o refrão&rdquo;), comece a linha com{" "}
            <code className="rounded bg-muted px-1">&gt;</code>. Ela aparece em azul e itálico.
          </p>
          <pre className="rounded-md bg-muted px-3 py-2 text-sm">{OBSERVACAO_EXAMPLE}</pre>
          <div className="rounded-md border px-3 py-2">
            <ChordSheet lines={parseCifra(OBSERVACAO_EXAMPLE)} />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Blocos da letra</h3>
          <p className="text-sm text-muted-foreground">
            Envolva um trecho com os delimitadores para marcá-lo com título, cor e itálico. O bloco
            pode ter várias linhas e só fecha com o delimitador do mesmo tipo. Sem fechamento, vai
            até o fim da cifra.
          </p>
          <ul className="flex flex-col gap-3">
            {BLOCK_DEFS.map((def) => {
              const sample = `${def.open}\nTrecho da letra\n${def.close}`;
              return (
                <li key={def.kind} className="grid gap-2 sm:grid-cols-2 sm:items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{def.titulo}</span>
                    <pre className="rounded-md bg-muted px-3 py-2 text-sm">{sample}</pre>
                  </div>
                  <ChordSheet lines={parseCifra(sample)} />
                </li>
              );
            })}
          </ul>
        </section>
      </DialogContent>
    </Dialog>
  );
}
