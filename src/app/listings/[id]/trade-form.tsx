"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/money";

type ListingOption = {
  id: string;
  title: string;
  partNumber: string;
  priceCents: number;
};

export function TradeForm({
  listingId,
  myListings,
}: {
  listingId: string;
  myListings: ListingOption[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [cash, setCash] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetListingId: listingId,
        offeredListingIds: selected,
        cashCents: Math.round(parseFloat(cash || "0") * 100),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Trade failed");
      return;
    }
    router.push("/trades");
    router.refresh();
  }

  if (myListings.length === 0) {
    return (
      <p className="text-sm text-[var(--steel)]">
        List one of your surplus parts first to propose a trade.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wide">Propose trade</h2>
      <p className="text-sm text-[var(--steel)]">Offer one or more of your active listings, plus optional cash.</p>
      <ul className="space-y-2">
        {myListings.map((l) => (
          <li key={l.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded border border-[var(--line)]/15 bg-[var(--field)] px-3 py-2">
              <input
                type="checkbox"
                checked={selected.includes(l.id)}
                onChange={() => toggle(l.id)}
                className="mt-1"
              />
              <span>
                <span className="font-medium">{l.title}</span>
                <span className="block text-sm text-[var(--steel)]">
                  #{l.partNumber} · {formatMoney(l.priceCents)}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <label className="block max-w-xs">
        <span className="text-sm">Cash top-up (USD)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={cash}
          onChange={(e) => setCash(e.target.value)}
          className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2"
        />
      </label>
      {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
      <button
        type="submit"
        disabled={loading || selected.length === 0}
        className="rounded border border-[var(--ink)] px-5 py-2.5 disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send trade offer"}
      </button>
    </form>
  );
}
