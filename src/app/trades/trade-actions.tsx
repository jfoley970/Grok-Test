"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TradeActions({
  tradeId,
  status,
  incoming,
  outgoing,
}: {
  tradeId: string;
  status: string;
  incoming: boolean;
  outgoing: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function act(action: "accept" | "reject" | "cancel") {
    setLoading(true);
    setError("");
    const res = await fetch("/api/trades", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tradeId, action }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Action failed");
      return;
    }
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    router.refresh();
  }

  if (status !== "pending" && status !== "awaiting_payment") {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2">
        {incoming && status === "pending" && (
          <>
            <button
              type="button"
              disabled={loading}
              onClick={() => act("accept")}
              className="rounded bg-[var(--signal)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
            >
              Accept
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => act("reject")}
              className="rounded border border-[var(--line)]/30 px-3 py-1.5 text-sm"
            >
              Reject
            </button>
          </>
        )}
        {outgoing && status === "pending" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => act("cancel")}
            className="rounded border border-[var(--line)]/30 px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
      {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
    </div>
  );
}
