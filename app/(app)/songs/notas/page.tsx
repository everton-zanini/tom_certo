import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listPlaylistSongNotesAdmin } from "@/services/playlist.actions";
import { NotasAdminList } from "@/components/playlist/NotasAdminList";

export default async function SongsNotasPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const items = await listPlaylistSongNotesAdmin();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Notas dos repertórios</h1>
      <NotasAdminList items={items} />
    </div>
  );
}
