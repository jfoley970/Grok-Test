"use client";

import { useState } from "react";

export function ConnectButton() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function connect() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/stripe/connect", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not start Connect onboarding");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <button
        type="button"
        onClick={connect}
        disabled={loading}
        className="bg-[var(--signal)] px-5 py-2.5 font-semibold uppercase tracking-[0.12em] text-[var(--ink)] disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Connect / continue Stripe"}
      </button>
      {error && <p className="mt-2 text-sm text-[var(--signal)]">{error}</p>}
    </div>
  );
}
