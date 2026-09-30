import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, appUrl } from "@/lib/stripe";
import { canManageStripe } from "@/lib/session";

export async function POST() {
  const session = await auth();
  if (!session?.user || !canManageStripe(session.user.role)) {
    return NextResponse.json({ error: "Only shop owners can connect Stripe" }, { status: 403 });
  }

  const shop = await prisma.shop.findUnique({ where: { id: session.user.shopId } });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  let accountId = shop.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: session.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: shop.name,
        product_description: "Auto parts surplus marketplace seller",
      },
      metadata: { shopId: shop.id },
    });
    accountId = account.id;
    await prisma.shop.update({
      where: { id: shop.id },
      data: { stripeAccountId: accountId },
    });
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: appUrl("/settings/stripe?refresh=1"),
    return_url: appUrl("/settings/stripe?return=1"),
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
