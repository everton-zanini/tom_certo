import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Olá, {session?.user?.name}</h1>
      <p className="text-muted-foreground">
        Dashboard: próximos repertórios, último repertório e favoritos aparecerão aqui.
      </p>
    </div>
  );
}
