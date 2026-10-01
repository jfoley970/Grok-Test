import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fitmentWhere } from "@/lib/vehicles";
import { VehicleFilters } from "@/components/vehicle-filters";
import { ListingGrid } from "@/components/listing-grid";
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
    include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide">Sell</h1>
      <p className="mt-2 text-[var(--muted)]">Your shop&apos;s surplus, filtered by vehicle.</p>
      <div className="mt-6">
        <VehicleFilters make={params.make} model={params.model} year={params.year} />
      </div>
      <ListingGrid
        empty="No matching parts on hand."
        listings={listings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          year: listing.year,
          make: listing.make,
          model: listing.model,
          brand: listing.brand,
          partNumber: listing.partNumber,
          quantity: listing.quantity,
          priceCents: listing.priceCents,
          status: listing.status,
          photoPath: listing.photos[0]?.path,
        }))}
      />

      <div className="mt-12 max-w-xl">
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide">Add part</h2>
        <SellForm />
      </div>
    </div>
  );
}
