import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/nav/LogoutButton";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { InstallAppButton } from "@/components/nav/InstallAppButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <Link href="/" className="font-semibold">
          Tom Certo
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/songs">Músicas</Link>
          <Link href="/playlists">Repertórios</Link>
          {session?.user?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
          <Link href="/account" className="text-muted-foreground hover:text-foreground">
            {session?.user?.name}
          </Link>
          <InstallAppButton />
          <ThemeToggle />
          <LogoutButton />
        </nav>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
