import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TeamForm } from "./team-form";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await requireRole(["owner"]);
  const members = await prisma.user.findMany({
    where: { shopId: session.user.shopId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide">Team</h1>
      <p className="mt-2 text-[var(--steel)]">
        Add service writer logins so they can post surplus inventory for {session.user.shopName}.
      </p>
      <ul className="mt-8 space-y-3">
        {members.map((m) => (
          <li key={m.id} className="rounded border border-[var(--line)]/15 bg-[var(--field)] px-4 py-3">
            <div className="font-medium">{m.name}</div>
            <div className="text-sm text-[var(--steel)]">
              {m.email} · {m.role === "owner" ? "Owner" : "Service writer"}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wide">
          Add service writer
        </h2>
        <TeamForm />
      </div>
    </div>
  );
}
