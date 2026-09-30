import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const type = session.metadata?.type;

      if (type === "purchase" && session.metadata?.orderId) {
        const orderId = session.metadata.orderId;
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order && order.status !== "paid") {
          await prisma.$transaction([
            prisma.order.update({
              where: { id: orderId },
              data: {
                status: "paid",
                stripePaymentIntent:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent?.id || null,
              },
            }),
            prisma.listing.update({
              where: { id: order.listingId },
              data: { status: "sold" },
            }),
          ]);
        }
      }

      if (type === "trade_cash" && session.metadata?.tradeOfferId) {
        const tradeId = session.metadata.tradeOfferId;
        await completeTrade(tradeId);
      }
    }

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      await prisma.shop.updateMany({
        where: { stripeAccountId: account.id },
        data: {
          chargesEnabled: Boolean(account.charges_enabled),
        },
      });
    }
  } catch (e) {
    console.error("Webhook handler error", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function completeTrade(tradeId: string) {
  const trade = await prisma.tradeOffer.findUnique({ where: { id: tradeId } });
  if (!trade || trade.status === "accepted") return;

  const offeredIds = JSON.parse(trade.offeredListingIds) as string[];

  await prisma.$transaction([
    prisma.tradeOffer.update({
      where: { id: tradeId },
      data: { status: "accepted" },
    }),
    prisma.listing.update({
      where: { id: trade.targetListingId },
      data: { status: "traded" },
    }),
    ...offeredIds.map((id) =>
      prisma.listing.update({
        where: { id },
        data: { status: "traded" },
      }),
    ),
  ]);
}
