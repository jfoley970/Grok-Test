"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Registration failed");
      return;
    }
    const sign = await signIn("credentials", {
      shop: String(payload.shopName),
      email: String(payload.email),
      password: String(payload.password),
      redirect: false,
    });
    setLoading(false);
    if (sign?.error) {
      router.push("/auth/signin");
      return;
    }
    router.push("/settings/stripe");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide">Register your shop</h1>
      <p className="mt-2 text-[var(--muted)]">
        Creates the shop and your owner login. Add service writers later from Team.
      </p>
      <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm">Shop name</span>
          <input name="shopName" required className="mt-1 w-full border border-[var(--steel)] bg-[var(--panel)] px-3 py-2 text-[var(--paper)] outline-none focus:border-[var(--signal)]" />
        </label>
        <label className="block">
          <span className="text-sm">City / region</span>
          <input name="cityRegion" required className="mt-1 w-full border border-[var(--steel)] bg-[var(--panel)] px-3 py-2 text-[var(--paper)] outline-none focus:border-[var(--signal)]" />
        </label>
        <label className="block">
          <span className="text-sm">Phone</span>
          <input name="phone" className="mt-1 w-full border border-[var(--steel)] bg-[var(--panel)] px-3 py-2 text-[var(--paper)] outline-none focus:border-[var(--signal)]" />
        </label>
        <label className="block">
          <span className="text-sm">Your name</span>
          <input name="name" required className="mt-1 w-full border border-[var(--steel)] bg-[var(--panel)] px-3 py-2 text-[var(--paper)] outline-none focus:border-[var(--signal)]" />
        </label>
        <label className="block">
          <span className="text-sm">Email</span>
          <input name="email" type="email" required className="mt-1 w-full border border-[var(--steel)] bg-[var(--panel)] px-3 py-2 text-[var(--paper)] outline-none focus:border-[var(--signal)]" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm">Password</span>
          <input name="password" type="password" minLength={6} required className="mt-1 w-full border border-[var(--steel)] bg-[var(--panel)] px-3 py-2 text-[var(--paper)] outline-none focus:border-[var(--signal)]" />
        </label>
        {error && <p className="sm:col-span-2 text-sm text-[var(--signal)]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 bg-[var(--signal)] px-4 py-2.5 font-medium text-[var(--ink)] disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create shop"}
        </button>
      </form>
      <p className="mt-6 text-sm text-[var(--muted)]">
        Already registered?{" "}
        <Link href="/auth/signin" className="text-[var(--signal)] underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
