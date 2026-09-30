import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    redirect("/browse");
  }
  return session;
}

export function canPostListings(role: UserRole) {
  return role === "owner" || role === "service_writer";
}

export function canManageStripe(role: UserRole) {
  return role === "owner";
}

export function canManageTeam(role: UserRole) {
  return role === "owner";
}
