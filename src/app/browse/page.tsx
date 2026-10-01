import { prisma } from "@/lib/prisma";
import { fitmentWhere } from "@/lib/vehicles";
import { VehicleFilters } from "@/components/vehicle-filters";
import { ListingGrid } from "@/components/listing-grid";

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
    include: { shop: true, postedBy: true, photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
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

      <ListingGrid
        empty="No active listings yet."
        listings={listings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          year: listing.year,
          make: listing.make,
          model: listing.model,
          partNumber: listing.partNumber,
          priceCents: listing.priceCents,
          photoPath: listing.photos[0]?.path,
          meta: `${listing.shop.name} · ${listing.shop.cityRegion}`,
        }))}
      />
    </div>
  );
}
