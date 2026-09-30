import { requireSession, canPostListings } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SellLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if (!canPostListings(session.user.role)) redirect("/browse");
  return children;
}
