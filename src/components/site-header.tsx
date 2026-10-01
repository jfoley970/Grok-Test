import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { AccountMenu } from "@/components/account-menu";

export async function SiteHeader() {
  const session = await auth();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="border-b border-[var(--steel)] bg-[var(--ink)] text-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="font-[family-name:var(--font-display)] text-2xl tracking-wide">
          SURPLUS
        </Link>
        {session?.user ? (
          <nav className="flex items-center gap-6 text-sm uppercase tracking-[0.18em]">
            <Link href="/browse" className="hover:text-[var(--signal)]">
              Buy
            </Link>
            <Link href="/sell" className="hover:text-[var(--signal)]">
              Sell
            </Link>
          </nav>
        ) : (
          <span className="flex-1" />
        )}
        {session?.user ? (
          <AccountMenu
            user={{
              name: session.user.name,
              shopName: session.user.shopName,
              role: session.user.role,
            }}
            signOutAction={signOutAction}
          />
        ) : (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/auth/signin" className="hover:text-[var(--signal)]">
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="bg-[var(--signal)] px-3 py-1.5 font-medium text-[var(--ink)]"
            >
              Register shop
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
