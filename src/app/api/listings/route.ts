import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canPostListings } from "@/lib/session";
import { isKnownFitment } from "@/lib/vehicles";

const schema = z.object({
  title: z.string().min(1),
  partNumber: z.string().min(1),
  condition: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int(),
  fitmentNotes: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  priceCents: z.coerce.number().int().min(1),
  shippingNotes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !canPostListings(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = schema.parse(await req.json());
    if (!isKnownFitment(data.make, data.model, data.year)) {
      return NextResponse.json({ error: "Choose a valid make, model, and year" }, { status: 400 });
    }
    const listing = await prisma.listing.create({
      data: {
        ...data,
        shippingNotes: data.shippingNotes || null,
        shopId: session.user.shopId,
        postedByUserId: session.user.id,
        status: "active",
      },
    });
    return NextResponse.json({ ok: true, id: listing.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
