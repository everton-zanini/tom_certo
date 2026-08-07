import { auth } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

export default async function AccountPage() {
  const session = await auth();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 p-4">
      <div>
        <h1 className="text-xl font-semibold">Minha conta</h1>
        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
