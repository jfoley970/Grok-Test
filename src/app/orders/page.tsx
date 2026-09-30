import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await requireSession();
  const orders = await prisma.order.findMany({
    where: {
      OR: [{ buyerShopId: session.user.shopId }, { sellerShopId: session.user.shopId }],
    },
    include: {
      listing: true,
      buyerShop: true,
      sellerShop: true,
      placedBy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide">Orders</h1>
      <p className="mt-2 text-[var(--steel)]">Purchases involving your shop.</p>
      <ul className="mt-8 divide-y divide-[var(--line)]/15 border-y border-[var(--line)]/15">
        {orders.length === 0 && <li className="py-8 text-[var(--steel)]">No orders yet.</li>}
        {orders.map((o) => {
          const buying = o.buyerShopId === session.user.shopId;
          return (
            <li key={o.id} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto]">
              <div>
                <Link href={`/listings/${o.listingId}`} className="font-medium text-[var(--signal)] underline">
                  {o.listing.title}
                </Link>
                <div className="mt-1 text-sm text-[var(--steel)]">
                  {buying ? "Bought from" : "Sold to"} {buying ? o.sellerShop.name : o.buyerShop.name} ·{" "}
                  <span className="capitalize">{o.status}</span>
                </div>
                <div className="text-sm text-[var(--muted)]">Placed by {o.placedBy.name}</div>
              </div>
              <div className="font-medium sm:text-right">{formatMoney(o.amountCents)}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
