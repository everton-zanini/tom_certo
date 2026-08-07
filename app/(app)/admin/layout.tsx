import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <nav className="flex gap-4 border-b pb-2 text-sm">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/songs">Músicas</Link>
        <Link href="/admin/users">Usuários</Link>
      </nav>
      {children}
    </div>
  );
}
