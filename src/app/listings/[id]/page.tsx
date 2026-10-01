import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { BuyButton } from "./buy-button";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { shop: true, postedBy: true },
  });
  if (!listing) notFound();

  const isOwn = session?.user?.shopId === listing.shopId;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/browse" className="text-sm text-[var(--muted)] hover:text-[var(--signal)]">
        ← Back to board
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl tracking-wide">
        {listing.title}
      </h1>
      <p className="mt-2 text-2xl">{formatMoney(listing.priceCents)}</p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-[var(--muted)]">Part number</dt>
          <dd>{listing.partNumber}</dd>
        </div>
        <div>
          <dt className="text-sm text-[var(--muted)]">Condition</dt>
          <dd>{listing.condition}</dd>
        </div>
        <div>
          <dt className="text-sm text-[var(--muted)]">Quantity</dt>
          <dd>{listing.quantity}</dd>
        </div>
        <div>
          <dt className="text-sm text-[var(--muted)]">Status</dt>
          <dd className="capitalize">{listing.status}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm text-[var(--muted)]">Vehicle</dt>
          <dd>
            {listing.year} {listing.make} {listing.model}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm text-[var(--muted)]">Fitment notes</dt>
          <dd>{listing.fitmentNotes}</dd>
        </div>
        {listing.shippingNotes && (
          <div className="sm:col-span-2">
            <dt className="text-sm text-[var(--muted)]">Shipping / pickup</dt>
            <dd>{listing.shippingNotes}</dd>
          </div>
        )}
        <div className="sm:col-span-2">
          <dt className="text-sm text-[var(--muted)]">Shop</dt>
          <dd>
            {listing.shop.name} · {listing.shop.cityRegion}
            <span className="block text-sm text-[var(--muted)]">
              Posted by {listing.postedBy.name} ({listing.postedBy.role === "owner" ? "owner" : "service writer"})
            </span>
          </dd>
        </div>
      </dl>

      {listing.status === "active" && session?.user && !isOwn && (
        <div className="mt-10 border-t border-[var(--steel)] pt-8">
          <BuyButton listingId={listing.id} canBuy={listing.shop.chargesEnabled} />
        </div>
      )}

      {listing.status === "active" && !session?.user && (
        <p className="mt-8 text-[var(--muted)]">
          <Link href="/auth/signin" className="text-[var(--signal)]">
            Sign in
          </Link>{" "}
          to buy this part.
        </p>
      )}
    </div>
  );
}
