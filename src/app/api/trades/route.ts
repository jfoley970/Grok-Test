import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, appUrl } from "@/lib/stripe";

const createSchema = z.object({
  targetListingId: z.string().min(1),
  offeredListingIds: z.array(z.string()).min(1),
  cashCents: z.coerce.number().int().min(0).default(0),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const data = createSchema.parse(await req.json());
    const target = await prisma.listing.findUnique({
      where: { id: data.targetListingId },
      include: { shop: true },
    });

    if (!target || target.status !== "active") {
      return NextResponse.json({ error: "Target listing unavailable" }, { status: 400 });
    }
    if (target.shopId === session.user.shopId) {
      return NextResponse.json({ error: "Cannot trade for your own listing" }, { status: 400 });
    }

    const offered = await prisma.listing.findMany({
      where: {
        id: { in: data.offeredListingIds },
        shopId: session.user.shopId,
        status: "active",
      },
    });
    if (offered.length !== data.offeredListingIds.length) {
      return NextResponse.json({ error: "One or more offered listings are invalid" }, { status: 400 });
    }

    const trade = await prisma.tradeOffer.create({
      data: {
        fromShopId: session.user.shopId,
        toShopId: target.shopId,
        targetListingId: target.id,
        offeredListingIds: JSON.stringify(data.offeredListingIds),
        cashCents: data.cashCents,
        createdByUserId: session.user.id,
        status: "pending",
      },
    });

    return NextResponse.json({ ok: true, id: trade.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create trade offer" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { tradeId, action } = await req.json();
  if (!tradeId || !["accept", "reject", "cancel"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const trade = await prisma.tradeOffer.findUnique({
    where: { id: tradeId },
    include: {
      targetListing: { include: { shop: true } },
      fromShop: true,
    },
  });

  if (!trade || (trade.status !== "pending" && trade.status !== "awaiting_payment")) {
    return NextResponse.json({ error: "Trade not available" }, { status: 400 });
  }

  if (action === "cancel") {
    if (trade.fromShopId !== session.user.shopId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.tradeOffer.update({
      where: { id: tradeId },
      data: { status: "cancelled" },
    });
    return NextResponse.json({ ok: true });
  }

  if (trade.toShopId !== session.user.shopId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "reject") {
    await prisma.tradeOffer.update({
      where: { id: tradeId },
      data: { status: "rejected" },
    });
    return NextResponse.json({ ok: true });
  }

  // accept
  const offeredIds = JSON.parse(trade.offeredListingIds) as string[];
  const stillActive = await prisma.listing.count({
    where: {
      id: { in: [trade.targetListingId, ...offeredIds] },
      status: "active",
    },
  });
  if (stillActive !== offeredIds.length + 1) {
    return NextResponse.json({ error: "One or more listings are no longer active" }, { status: 400 });
  }

  if (trade.cashCents > 0) {
    const sellerAccount = trade.targetListing.shop.stripeAccountId;
    if (!sellerAccount || !trade.targetListing.shop.chargesEnabled) {
      return NextResponse.json(
        { error: "Receiving shop must finish Stripe onboarding for cash trades" },
        { status: 400 },
      );
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: trade.cashCents,
            product_data: {
              name: `Trade cash top-up for ${trade.targetListing.title}`,
            },
          },
        },
      ],
      payment_intent_data: {
        transfer_data: { destination: sellerAccount },
        metadata: { tradeOfferId: trade.id, type: "trade_cash" },
      },
      metadata: { tradeOfferId: trade.id, type: "trade_cash" },
      success_url: appUrl(`/trades?paid=1&trade=${trade.id}`),
      cancel_url: appUrl(`/trades?cancelled=1`),
    });

    await prisma.tradeOffer.update({
      where: { id: trade.id },
      data: {
        status: "awaiting_payment",
        stripeCheckoutSession: checkout.id,
      },
    });

    return NextResponse.json({ ok: true, checkoutUrl: checkout.url });
  }

  await prisma.$transaction([
    prisma.tradeOffer.update({
      where: { id: trade.id },
      data: { status: "accepted" },
    }),
    prisma.listing.update({
      where: { id: trade.targetListingId },
      data: { status: "traded" },
    }),
    ...offeredIds.map((id: string) =>
      prisma.listing.update({
        where: { id },
        data: { status: "traded" },
      }),
    ),
  ]);

  return NextResponse.json({ ok: true });
}
