import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { ConnectButton } from "./connect-button";

export const dynamic = "force-dynamic";

export default async function StripeSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string; refresh?: string }>;
}) {
  const session = await requireRole(["owner"]);
  const params = await searchParams;
  let shop = await prisma.shop.findUniqueOrThrow({ where: { id: session.user.shopId } });

  if (shop.stripeAccountId && (params.return || params.refresh)) {
    try {
      const account = await stripe.accounts.retrieve(shop.stripeAccountId);
      shop = await prisma.shop.update({
        where: { id: shop.id },
        data: { chargesEnabled: Boolean(account.charges_enabled) },
      });
    } catch {
      // Stripe keys may be placeholders in local dev
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide">Stripe Connect</h1>
      <p className="mt-2 text-[var(--muted)]">
        Owners connect an Express account so other shops can buy your surplus parts in-app.
      </p>
      <dl className="mt-8 space-y-3 border border-[var(--steel)] bg-[var(--panel)] p-5">
        <div>
          <dt className="text-sm text-[var(--muted)]">Shop</dt>
          <dd>{shop.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-[var(--muted)]">Stripe account</dt>
          <dd className="font-mono text-sm">{shop.stripeAccountId || "Not connected"}</dd>
        </div>
        <div>
          <dt className="text-sm text-[var(--muted)]">Charges enabled</dt>
          <dd>{shop.chargesEnabled ? "Yes — ready to sell" : "No — finish onboarding"}</dd>
        </div>
      </dl>
      <div className="mt-6">
        <ConnectButton />
      </div>
      <p className="mt-6 text-sm text-[var(--muted)]">
        Use Stripe test mode keys in <code>.env</code>. Forward webhooks with the Stripe CLI to{" "}
        <code>/api/stripe/webhook</code>.
      </p>
    </div>
  );
}
