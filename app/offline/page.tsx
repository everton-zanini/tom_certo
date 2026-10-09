import Image from "next/image";
import { RetryButton } from "@/app/offline/retry-button";

export const metadata = { title: "Sem conexão · Tom Certo" };

export default function OfflinePage() {
  return (
    <main className="pt-safe pb-safe flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Image src="/tom_certo_icone.png" alt="" width={64} height={64} className="rounded-2xl" />
      <h1 className="text-2xl font-bold tracking-tight">Sem conexão</h1>
      <p className="max-w-xs text-muted-foreground">
        As cifras e repertórios precisam de internet. Reconecte e tente de novo.
      </p>
      <RetryButton />
    </main>
  );
}
