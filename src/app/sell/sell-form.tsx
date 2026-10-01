"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VEHICLE_MAKES, VEHICLE_YEARS, modelsForMake } from "@/lib/vehicles";

const fieldClass =
  "mt-1 w-full border border-[var(--steel)] bg-[var(--panel)] px-3 py-2 text-[var(--paper)] outline-none focus:border-[var(--signal)]";

export function SellForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const models = modelsForMake(make);

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
      make: form.get("make"),
      model: form.get("model"),
      year: Number(form.get("year")),
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
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm">Make</span>
          <select
            name="make"
            required
            value={make}
            onChange={(event) => {
              setMake(event.target.value);
              setModel("");
            }}
            className={fieldClass}
          >
            <option value="">Select</option>
            {VEHICLE_MAKES.map((entry) => (
              <option key={entry.make} value={entry.make}>
                {entry.make}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Model</span>
          <select
            name="model"
            required
            value={model}
            onChange={(event) => setModel(event.target.value)}
            disabled={!make}
            className={`${fieldClass} disabled:opacity-50`}
          >
            <option value="">Select</option>
            {models.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Year</span>
          <select name="year" required defaultValue="" className={fieldClass}>
            <option value="">Select</option>
            {VEHICLE_YEARS.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm">Title</span>
        <input name="title" required placeholder="OEM brake caliper — RH" className={fieldClass} />
      </label>
      <label className="block">
        <span className="text-sm">Part number</span>
        <input name="partNumber" required className={fieldClass} />
      </label>
      <label className="block">
        <span className="text-sm">Condition</span>
        <select name="condition" className={fieldClass}>
          <option>New</option>
          <option>New open box</option>
          <option>Used — good</option>
          <option>Used — fair</option>
          <option>Core / rebuildable</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm">Fitment notes</span>
        <textarea name="fitmentNotes" required rows={3} className={fieldClass} />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">Quantity</span>
          <input name="quantity" type="number" min={1} defaultValue={1} required className={fieldClass} />
        </label>
        <label className="block">
          <span className="text-sm">Price (USD)</span>
          <input name="price" type="number" min={0.01} step={0.01} required className={fieldClass} />
        </label>
      </div>
      <label className="block">
        <span className="text-sm">Shipping / pickup notes</span>
        <input name="shippingNotes" className={fieldClass} />
      </label>
      {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
      <button type="submit" disabled={loading} className="bg-[var(--signal)] px-5 py-2.5 font-medium text-[var(--ink)] disabled:opacity-60">
        {loading ? "Posting…" : "Post to marketplace"}
      </button>
    </form>
  );
}
