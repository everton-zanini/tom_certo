import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/nav/LogoutButton";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { InstallAppButton } from "@/components/nav/InstallAppButton";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <Link href="/" className="font-semibold">
          Tom Certo
        </Link>
        <nav className="hidden items-center gap-4 text-sm md:flex">
          <Link href="/songs">Músicas</Link>
          <Link href="/playlists">Repertórios</Link>
          {isAdmin && <Link href="/admin">Admin</Link>}
          <Link href="/account" className="text-muted-foreground hover:text-foreground">
            {session?.user?.name}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <InstallAppButton />
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col pb-16 md:pb-0">{children}</main>
      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
