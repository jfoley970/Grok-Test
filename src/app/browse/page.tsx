import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const listings = await prisma.listing.findMany({
    where: {
      status: "active",
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide">Parts board</h1>
          <p className="mt-2 text-[var(--steel)]">Active surplus from shops on BenchStock.</p>
        </div>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={query}
            placeholder="Part # or keyword"
            className="min-w-[220px] rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2"
          />
          <button type="submit" className="rounded bg-[var(--ink)] px-4 py-2 text-[var(--paper)]">
            Search
          </button>
        </form>
      </div>

      <div className="mt-8 divide-y divide-[var(--line)]/15 border-y border-[var(--line)]/15">
        {listings.length === 0 && (
          <p className="py-10 text-[var(--steel)]">No active listings yet.</p>
        )}
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="grid gap-2 py-5 transition hover:bg-[var(--ink)]/[0.03] sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <div className="font-medium">{listing.title}</div>
              <div className="mt-1 text-sm text-[var(--steel)]">
                #{listing.partNumber} · {listing.condition} · {listing.shop.name} ({listing.shop.cityRegion})
              </div>
              <div className="mt-1 text-sm text-[var(--muted)]">
                Posted by {listing.postedBy.name}
              </div>
            </div>
            <div className="text-lg font-medium sm:text-right">{formatMoney(listing.priceCents)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
