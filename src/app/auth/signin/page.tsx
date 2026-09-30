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
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/browse");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide">Sign in</h1>
      <p className="mt-2 text-[var(--steel)]">
        Shop owners and service writers use the same sign-in.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm">Email</span>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm">Password</span>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border border-[var(--line)]/20 bg-[var(--field)] px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[var(--ink)] px-4 py-2.5 text-[var(--paper)] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-[var(--steel)]">
        New shop?{" "}
        <Link href="/auth/register" className="text-[var(--signal)] underline">
          Register
        </Link>
      </p>
    </div>
  );
}
