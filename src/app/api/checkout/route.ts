import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, appUrl } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { listingId } = await req.json();
  if (!listingId) {
    return NextResponse.json({ error: "listingId required" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { shop: true },
  });

  if (!listing || listing.status !== "active") {
    return NextResponse.json({ error: "Listing not available" }, { status: 400 });
  }
  if (listing.shopId === session.user.shopId) {
    return NextResponse.json({ error: "Cannot buy your own listing" }, { status: 400 });
  }
  if (!listing.shop.stripeAccountId || !listing.shop.chargesEnabled) {
    return NextResponse.json(
      { error: "Seller has not finished Stripe Connect onboarding" },
      { status: 400 },
    );
  }

  const order = await prisma.order.create({
    data: {
      listingId: listing.id,
      buyerShopId: session.user.shopId,
      sellerShopId: listing.shopId,
      placedByUserId: session.user.id,
      amountCents: listing.priceCents,
      status: "pending",
    },
  });

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: listing.priceCents,
          product_data: {
            name: listing.title,
            description: `Part # ${listing.partNumber}`,
          },
        },
      },
    ],
    payment_intent_data: {
      transfer_data: {
        destination: listing.shop.stripeAccountId,
      },
      metadata: {
        orderId: order.id,
        listingId: listing.id,
        type: "purchase",
      },
    },
    metadata: {
      orderId: order.id,
      listingId: listing.id,
      type: "purchase",
    },
    success_url: appUrl(`/orders?success=1&order=${order.id}`),
    cancel_url: appUrl(`/listings/${listing.id}?cancelled=1`),
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSession: checkout.id },
  });

  await prisma.listing.update({
    where: { id: listing.id },
    data: { status: "reserved" },
  });

  return NextResponse.json({ url: checkout.url });
}
