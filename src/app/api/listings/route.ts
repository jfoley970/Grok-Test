import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canPostListings } from "@/lib/session";
import { isKnownFitment } from "@/lib/vehicles";
import { assertListingPhotos, saveListingPhotos } from "@/lib/photos";

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
    const form = await req.formData();
    const data = schema.parse({
      title: form.get("title"),
      partNumber: form.get("partNumber"),
      condition: form.get("condition"),
      make: form.get("make"),
      model: form.get("model"),
      year: form.get("year"),
      fitmentNotes: form.get("fitmentNotes"),
      quantity: form.get("quantity"),
      priceCents: form.get("priceCents"),
      shippingNotes: form.get("shippingNotes") || undefined,
    });
    if (!isKnownFitment(data.make, data.model, data.year)) {
      return NextResponse.json({ error: "Choose a valid make, model, and year" }, { status: 400 });
    }

    const files = assertListingPhotos(
      form.getAll("photos").filter((entry): entry is File => entry instanceof File),
    );

    const listing = await prisma.listing.create({
      data: {
        ...data,
        shippingNotes: data.shippingNotes || null,
        shopId: session.user.shopId,
        postedByUserId: session.user.id,
        status: "active",
      },
    });

    const photos = await saveListingPhotos(listing.id, files);
    if (photos.length > 0) {
      await prisma.listingPhoto.createMany({
        data: photos.map((photo) => ({ ...photo, listingId: listing.id })),
      });
    }

    return NextResponse.json({ ok: true, id: listing.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    if (e instanceof Error && /photo/i.test(e.message)) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
