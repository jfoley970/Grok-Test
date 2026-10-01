"use client";

import { useState } from "react";
import Link from "next/link";

type AccountUser = {
  name: string;
  shopName: string;
  role: "owner" | "service_writer";
};

export function AccountMenu({
  user,
  signOutAction,
}: {
  user: AccountUser;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const roleLabel = user.role === "owner" ? "Owner" : "Service writer";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-right text-sm leading-tight"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="block text-[var(--paper)]">{user.name}</span>
        <span className="block text-xs text-[var(--muted)]">
          {user.shopName} · {roleLabel}
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-3 min-w-44 border border-[var(--steel)] bg-[var(--panel)] py-1 text-sm"
        >
          <Link
            href="/orders"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 hover:bg-[var(--ink)] hover:text-[var(--signal)]"
          >
            Orders
          </Link>
          {user.role === "owner" && (
            <>
              <Link
                href="/team"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 hover:bg-[var(--ink)] hover:text-[var(--signal)]"
              >
                Team
              </Link>
              <Link
                href="/settings/stripe"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 hover:bg-[var(--ink)] hover:text-[var(--signal)]"
              >
                Stripe
              </Link>
            </>
          )}
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-4 py-2 text-left text-[var(--muted)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
