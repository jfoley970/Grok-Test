import Link from "next/link";

export default function HomePage() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,#3d4a52_0%,transparent_50%),linear-gradient(135deg,#1a1714_0%,#2c241c_45%,#1a1714_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(243,239,230,0.06) 48px), repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(243,239,230,0.04) 48px)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-[84vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 text-[var(--paper)] sm:pb-24">
        <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
          For service writers &amp; shop owners
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-6xl leading-none tracking-wide sm:text-8xl">
          SURPLUS
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[var(--paper)]/85">
          Move surplus auto parts between shops. List what&apos;s sitting on the shelf or buy what you need,
          paid in-app with Stripe.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/browse"
            className="rounded bg-[var(--signal)] px-5 py-3 font-medium text-[var(--ink)] transition hover:brightness-110"
          >
            Buy
          </Link>
          <Link
            href="/sell"
            className="rounded border border-[var(--paper)]/40 px-5 py-3 text-[var(--paper)] transition hover:border-[var(--paper)]"
          >
            Sell
          </Link>
        </div>
      </div>
    </section>
  );
}
