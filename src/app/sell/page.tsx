import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { fitmentWhere } from "@/lib/vehicles";
import { VehicleFilters } from "@/components/vehicle-filters";
import { SellForm } from "./sell-form";

export const dynamic = "force-dynamic";

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; model?: string; year?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  const params = await searchParams;
  const listings = await prisma.listing.findMany({
    where: {
      shopId: session.user.shopId,
      ...fitmentWhere(params.make, params.model, params.year),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide">Sell</h1>
      <p className="mt-2 text-[var(--muted)]">Your shop&apos;s surplus, filtered by vehicle.</p>
      <div className="mt-6">
        <VehicleFilters make={params.make} model={params.model} year={params.year} />
      </div>
      <div className="mt-8 divide-y divide-[var(--steel)]/50 border-y border-[var(--steel)]">
        {listings.length === 0 && <p className="py-10 text-[var(--muted)]">No matching parts posted yet.</p>}
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="grid gap-2 py-5 transition hover:bg-[var(--panel)] sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <div className="font-medium">{listing.title}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                {listing.year} {listing.make} {listing.model} · #{listing.partNumber} · {listing.status}
              </div>
            </div>
            <div className="text-lg font-medium sm:text-right">{formatMoney(listing.priceCents)}</div>
          </Link>
        ))}
      </div>

      <div className="mt-12 max-w-xl">
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide">Post a part</h2>
        <SellForm />
      </div>
    </div>
  );
}
