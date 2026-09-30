"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TeamForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <label className="block">
        <span className="text-sm">Name</span>
        <input name="name" required className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2" />
      </label>
      <label className="block">
        <span className="text-sm">Email</span>
        <input name="email" type="email" required className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2" />
      </label>
      <label className="block">
        <span className="text-sm">Temporary password</span>
        <input name="password" type="password" minLength={6} required className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2" />
      </label>
      {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
      <button type="submit" disabled={loading} className="rounded bg-[var(--ink)] px-4 py-2 text-[var(--paper)] disabled:opacity-60">
        {loading ? "Adding…" : "Create login"}
      </button>
    </form>
  );
}
