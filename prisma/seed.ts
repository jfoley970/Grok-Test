import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shop.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const shopA = await prisma.shop.create({
    data: {
      name: "Riverside Auto Care",
      cityRegion: "Denver, CO",
      phone: "303-555-0101",
      chargesEnabled: true,
      stripeAccountId: "acct_seed_riverside",
      users: {
        create: [
          {
            email: "owner@riverside.shop",
            name: "Alex Owner",
            role: "owner",
            passwordHash,
          },
          {
            email: "writer@riverside.shop",
            name: "Sam Writer",
            role: "service_writer",
            passwordHash,
          },
        ],
      },
    },
    include: { users: true },
  });

  const shopB = await prisma.shop.create({
    data: {
      name: "Peak Performance Motors",
      cityRegion: "Boulder, CO",
      phone: "303-555-0199",
      chargesEnabled: true,
      stripeAccountId: "acct_seed_peak",
      users: {
        create: [
          {
            email: "owner@peak.shop",
            name: "Jordan Owner",
            role: "owner",
            passwordHash,
          },
          {
            email: "writer@peak.shop",
            name: "Casey Writer",
            role: "service_writer",
            passwordHash,
          },
        ],
      },
    },
    include: { users: true },
  });

  const writerA = shopA.users.find((u) => u.role === "service_writer")!;
  const writerB = shopB.users.find((u) => u.role === "service_writer")!;

  await prisma.listing.createMany({
    data: [
      {
        title: "OEM front brake pads — Toyota Camry",
        brand: "Toyota",
        partNumber: "04465-33470",
        condition: "New",
        make: "Toyota",
        model: "Camry",
        year: 2020,
        fitmentNotes: "2018–2023 Camry SE/XSE",
        quantity: 2,
        priceCents: 4800,
        shippingNotes: "Local pickup preferred",
        shopId: shopA.id,
        postedByUserId: writerA.id,
      },
      {
        title: "Alternator — Ford F-150 5.0",
        brand: "Motorcraft",
        partNumber: "FL3Z-10346-A",
        condition: "Used — good",
        make: "Ford",
        model: "F-150",
        year: 2018,
        fitmentNotes: "2015–2020 F-150 5.0L Coyote",
        quantity: 1,
        priceCents: 12500,
        shippingNotes: "Can ship freight",
        shopId: shopA.id,
        postedByUserId: writerA.id,
      },
      {
        title: "Radiator assembly — Honda Civic",
        brand: "Honda",
        partNumber: "19010-5BA-A01",
        condition: "New open box",
        make: "Honda",
        model: "Civic",
        year: 2019,
        fitmentNotes: "2016–2021 Civic 1.5T",
        quantity: 1,
        priceCents: 18900,
        shopId: shopB.id,
        postedByUserId: writerB.id,
      },
      {
        title: "Ignition coil pack set",
        brand: "ACDelco",
        partNumber: "UF648",
        condition: "New",
        make: "Chevrolet",
        model: "Equinox",
        year: 2017,
        fitmentNotes: "GM 3.6 LLT / LFX — verify before order",
        quantity: 4,
        priceCents: 9200,
        shopId: shopB.id,
        postedByUserId: writerB.id,
      },
    ],
  });

  console.log("Seeded shops:");
  console.log("  Riverside — owner@riverside.shop / writer@riverside.shop  password: password123");
  console.log("  Peak — owner@peak.shop / writer@peak.shop  password: password123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
