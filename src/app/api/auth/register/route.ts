import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  shopName: z.string().min(1),
  cityRegion: z.string().min(1),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const email = data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const shop = await prisma.shop.create({
      data: {
        name: data.shopName,
        cityRegion: data.cityRegion,
        phone: data.phone || null,
        users: {
          create: {
            email,
            passwordHash,
            name: data.name,
            role: "owner",
          },
        },
      },
      include: { users: true },
    });

    return NextResponse.json({
      ok: true,
      shopId: shop.id,
      userId: shop.users[0].id,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
