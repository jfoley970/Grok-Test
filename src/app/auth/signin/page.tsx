"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      shop: String(form.get("shop")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Shop, username, or password is wrong");
      return;
    }
    router.push("/browse");
    router.refresh();
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] flex-col justify-center bg-[var(--ink)] px-4 py-16 text-[var(--paper)]">
      <div className="mx-auto w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Shop floor</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-6xl leading-none tracking-wide">
          SURPLUS
        </h1>
        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Shop</span>
            <input
              name="shop"
              type="text"
              required
              autoComplete="organization"
              className="mt-1 w-full border border-[var(--steel)] bg-[var(--panel)] px-3 py-2 text-[var(--paper)] outline-none focus:border-[var(--signal)]"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Username or email</span>
            <input
              name="email"
              type="text"
              required
              autoComplete="username"
              className="mt-1 w-full border border-[var(--steel)] bg-[var(--panel)] px-3 py-2 text-[var(--paper)] outline-none focus:border-[var(--signal)]"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full border border-[var(--steel)] bg-[var(--panel)] px-3 py-2 text-[var(--paper)] outline-none focus:border-[var(--signal)]"
            />
          </label>
          {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--signal)] px-4 py-2.5 font-medium text-[var(--ink)] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-8 text-sm text-[var(--muted)]">
          New shop?{" "}
          <Link href="/auth/register" className="text-[var(--signal)]">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
