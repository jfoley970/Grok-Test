import Link from "next/link";
import { formatMoney } from "@/lib/money";

export type ListingCard = {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  brand: string;
  partNumber: string;
  quantity: number;
  priceCents: number;
  status?: string;
  photoPath?: string | null;
  meta?: string;
};

export function ListingGrid({ listings, empty }: { listings: ListingCard[]; empty: string }) {
  if (listings.length === 0) {
    return <p className="mt-8 py-10 text-[var(--muted)]">{empty}</p>;
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/listings/${listing.id}`}
          className="border border-[var(--steel)] bg-[var(--panel)] transition hover:border-[var(--paper)]"
        >
          <div className="aspect-square border-b border-[var(--steel)] bg-[#0c0b09]">
            {listing.photoPath ? (
              <img src={listing.photoPath} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[var(--muted)]">No photo</div>
            )}
          </div>
          <div className="space-y-1 p-3">
            <div className="line-clamp-2 font-medium">{listing.title}</div>
            <div className="text-sm text-[var(--muted)]">
              {listing.year} {listing.make} {listing.model}
            </div>
            <div className="text-sm text-[var(--muted)]">
              {listing.brand} {listing.partNumber}
            </div>
            <div className="text-sm text-[var(--muted)]">Qty on hand {listing.quantity}</div>
            {listing.meta && <div className="text-sm text-[var(--muted)]">{listing.meta}</div>}
            <div className="flex items-center justify-between gap-2 pt-2">
              <span className="font-[family-name:var(--font-display)] text-2xl leading-none tracking-wide text-[var(--paper)]">
                {formatMoney(listing.priceCents)}
              </span>
              {listing.status && listing.status !== "active" && (
                <span className="text-xs uppercase tracking-wide text-[var(--muted)]">{listing.status}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
