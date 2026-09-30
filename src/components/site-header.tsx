import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-[var(--line)] bg-[var(--ink)] text-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-[family-name:var(--font-display)] text-xl tracking-wide">
          BenchStock
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/browse" className="hover:text-[var(--signal)]">
            Browse
          </Link>
          {session?.user ? (
            <>
              <Link href="/sell" className="hover:text-[var(--signal)]">
                List surplus
              </Link>
              <Link href="/trades" className="hover:text-[var(--signal)]">
                Trades
              </Link>
              <Link href="/orders" className="hover:text-[var(--signal)]">
                Orders
              </Link>
              {session.user.role === "owner" && (
                <>
                  <Link href="/team" className="hover:text-[var(--signal)]">
                    Team
                  </Link>
                  <Link href="/settings/stripe" className="hover:text-[var(--signal)]">
                    Stripe
                  </Link>
                </>
              )}
              <span className="hidden text-[var(--muted)] sm:inline">
                {session.user.shopName} · {session.user.role === "owner" ? "Owner" : "Service writer"}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="text-[var(--muted)] hover:text-[var(--paper)]">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-[var(--signal)]">
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="rounded bg-[var(--signal)] px-3 py-1.5 font-medium text-[var(--ink)]"
              >
                Register shop
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
