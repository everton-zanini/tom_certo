import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/account/ProfileForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { tom: true } })
    : null;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 p-4">
      <div>
        <h1 className="text-xl font-semibold">Minha conta</h1>
        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
      </div>
      <ProfileForm tom={user?.tom ?? null} />
      <ChangePasswordForm />
    </div>
  );
}
