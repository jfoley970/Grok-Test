import Link from "next/link";

export default function HomePage() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1c1b18_0%,#0e0e0c_62%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-[84vh] max-w-6xl flex-col justify-end px-4 pb-20 pt-24">
        <p className="mb-3 text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
          Shop to shop parts
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-7xl leading-none tracking-[0.06em] sm:text-9xl">
          SURPLUS
        </h1>
        <p className="mt-5 max-w-xl text-2xl leading-tight text-[var(--paper)]">
          Extra parts off the bench and into the next bay. Listed by the shop, bought by the shop.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/browse"
            className="border border-[var(--paper)] bg-[var(--panel)] px-6 py-3 text-lg font-semibold uppercase tracking-[0.14em] text-[var(--paper)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
          >
            Buy parts
          </Link>
          <Link
            href="/sell"
            className="border border-[var(--steel)] px-6 py-3 text-lg font-semibold uppercase tracking-[0.14em] text-[var(--paper)] hover:border-[var(--paper)]"
          >
            List surplus
          </Link>
        </div>
      </div>
    </section>
  );
}
