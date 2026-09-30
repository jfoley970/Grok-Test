import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { TradeActions } from "./trade-actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TradesPage() {
  const session = await requireSession();
  const trades = await prisma.tradeOffer.findMany({
    where: {
      OR: [{ fromShopId: session.user.shopId }, { toShopId: session.user.shopId }],
    },
    include: {
      targetListing: true,
      fromShop: true,
      toShop: true,
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const offeredMap = new Map<string, { id: string; title: string }[]>();
  for (const t of trades) {
    const ids = JSON.parse(t.offeredListingIds) as string[];
    const listings = await prisma.listing.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true },
    });
    offeredMap.set(t.id, listings);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide">Trades</h1>
      <p className="mt-2 text-[var(--steel)]">Incoming and outgoing offers for your shop.</p>
      <ul className="mt-8 space-y-6">
        {trades.length === 0 && <li className="text-[var(--steel)]">No trade offers yet.</li>}
        {trades.map((t) => {
          const incoming = t.toShopId === session.user.shopId;
          const offered = offeredMap.get(t.id) || [];
          return (
            <li key={t.id} className="rounded border border-[var(--line)]/15 bg-[var(--field)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm uppercase tracking-wide text-[var(--muted)]">
                    {incoming ? "Incoming" : "Outgoing"} · {t.status.replace("_", " ")}
                  </div>
                  <div className="mt-1 font-medium">
                    Want:{" "}
                    <Link href={`/listings/${t.targetListingId}`} className="text-[var(--signal)] underline">
                      {t.targetListing.title}
                    </Link>
                  </div>
                  <div className="mt-2 text-sm text-[var(--steel)]">
                    Offer: {offered.map((o) => o.title).join(", ") || "—"}
                    {t.cashCents > 0 ? ` + ${formatMoney(t.cashCents)} cash` : ""}
                  </div>
                  <div className="mt-1 text-sm text-[var(--muted)]">
                    {t.fromShop.name} → {t.toShop.name} · by {t.createdBy.name}
                  </div>
                </div>
                <TradeActions
                  tradeId={t.id}
                  status={t.status}
                  incoming={incoming}
                  outgoing={t.fromShopId === session.user.shopId}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
