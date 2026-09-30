"use client";

import { useState } from "react";

export function BuyButton({ listingId, canBuy }: { listingId: string; canBuy: boolean }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function buy() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Checkout failed");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wide">Buy with Stripe</h2>
      {!canBuy && (
        <p className="mt-2 text-sm text-[var(--signal)]">
          This shop hasn&apos;t finished Stripe Connect onboarding yet.
        </p>
      )}
      <button
        type="button"
        onClick={buy}
        disabled={!canBuy || loading}
        className="mt-3 rounded bg-[var(--signal)] px-5 py-2.5 font-medium text-[var(--ink)] disabled:opacity-50"
      >
        {loading ? "Starting checkout…" : "Buy now"}
      </button>
      {error && <p className="mt-2 text-sm text-[var(--signal)]">{error}</p>}
    </div>
  );
}
