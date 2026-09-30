"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const price = parseFloat(String(form.get("price") || "0"));
    const payload = {
      title: form.get("title"),
      partNumber: form.get("partNumber"),
      condition: form.get("condition"),
      fitmentNotes: form.get("fitmentNotes"),
      quantity: Number(form.get("quantity") || 1),
      priceCents: Math.round(price * 100),
      shippingNotes: form.get("shippingNotes") || undefined,
    };
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to list part");
      return;
    }
    router.push(`/listings/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide">List surplus</h1>
      <p className="mt-2 text-[var(--steel)]">
        Service writers and owners can post parts sitting on the shelf.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm">Title</span>
          <input name="title" required placeholder="OEM brake caliper — RH" className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Part number</span>
          <input name="partNumber" required className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm">Condition</span>
          <select name="condition" className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2">
            <option>New</option>
            <option>New open box</option>
            <option>Used — good</option>
            <option>Used — fair</option>
            <option>Core / rebuildable</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Fitment notes</span>
          <textarea name="fitmentNotes" required rows={3} className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm">Quantity</span>
            <input name="quantity" type="number" min={1} defaultValue={1} required className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm">Price (USD)</span>
            <input name="price" type="number" min={0.01} step={0.01} required className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2" />
          </label>
        </div>
        <label className="block">
          <span className="text-sm">Shipping / pickup notes</span>
          <input name="shippingNotes" className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2" />
        </label>
        {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
        <button type="submit" disabled={loading} className="rounded bg-[var(--ink)] px-5 py-2.5 text-[var(--paper)] disabled:opacity-60">
          {loading ? "Posting…" : "Post to marketplace"}
        </button>
      </form>
    </div>
  );
}
