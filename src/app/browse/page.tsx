import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { fitmentWhere } from "@/lib/vehicles";
import { VehicleFilters } from "@/components/vehicle-filters";

export const dynamic = "force-dynamic";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; make?: string; model?: string; year?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  const listings = await prisma.listing.findMany({
    where: {
      status: "active",
      ...fitmentWhere(params.make, params.model, params.year),
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { partNumber: { contains: query } },
              { fitmentNotes: { contains: query } },
            ],
          }
        : {}),
    },
    include: { shop: true, postedBy: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide">Buy</h1>
        <p className="mt-2 text-[var(--muted)]">Active parts from shops on Surplus.</p>
      </div>
      <div className="mt-6">
        <VehicleFilters
          make={params.make}
          model={params.model}
          year={params.year}
          query={query}
          showQuery
        />
      </div>

      <div className="mt-8 divide-y divide-[var(--steel)]/50 border-y border-[var(--steel)]">
        {listings.length === 0 && (
          <p className="py-10 text-[var(--muted)]">No active listings yet.</p>
        )}
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="grid gap-2 py-5 transition hover:bg-[var(--panel)] sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <div className="font-medium">{listing.title}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                {listing.year} {listing.make} {listing.model} · #{listing.partNumber} · {listing.condition}
              </div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                {listing.shop.name} ({listing.shop.cityRegion}) · Posted by {listing.postedBy.name}
              </div>
            </div>
            <div className="text-lg font-medium sm:text-right">{formatMoney(listing.priceCents)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
