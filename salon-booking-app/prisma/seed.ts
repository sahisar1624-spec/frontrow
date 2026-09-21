import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---- Everything in this file is placeholder demo content. -----------------
// Swap it for the real salon's details from Admin → Settings once running,
// or replace the values below and re-run `npm run db:seed`.
// -----------------------------------------------------------------------

async function main() {
  await prisma.salon.upsert({
    where: { id: "salon" },
    update: {},
    create: {
      id: "salon",
      name: "Petal & Palm",
      tagline: "Nails, hair, and a little quiet.",
      address: "482 Ashgrove Lane, Portland, OR 97214",
      phone: "(503) 555-0148",
      email: "hello@petalandpalm.com",
      instagram: "@petalandpalmsalon",
      aboutText:
        "We're a small studio that believes a good appointment should feel like an exhale. Come as you are.",
    },
  });

  const hours: {
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }[] = [
    { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "18:00" }, // Sun
    { dayOfWeek: 1, isOpen: false, openTime: "09:00", closeTime: "18:00" }, // Mon
    { dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "18:00" }, // Tue
    { dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "18:00" }, // Wed
    { dayOfWeek: 4, isOpen: true, openTime: "10:00", closeTime: "19:00" }, // Thu
    { dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "18:00" }, // Fri
    { dayOfWeek: 6, isOpen: true, openTime: "09:00", closeTime: "16:00" }, // Sat
  ];
  for (const h of hours) {
    await prisma.workingHour.upsert({
      where: { dayOfWeek: h.dayOfWeek },
      update: h,
      create: h,
    });
  }

  const catalog: {
    slug: string;
    name: string;
    services: { name: string; durationMin: number; price: number; description?: string }[];
  }[] = [
    {
      slug: "nails",
      name: "Nails",
      services: [
        { name: "Classic Manicure", durationMin: 30, price: 32 },
        { name: "Gel Manicure", durationMin: 45, price: 48 },
        { name: "Spa Pedicure", durationMin: 50, price: 58 },
        { name: "Nail Art, per set", durationMin: 20, price: 18 },
      ],
    },
    {
      slug: "hair",
      name: "Hair",
      services: [
        { name: "Women's Haircut", durationMin: 45, price: 65 },
        { name: "Men's Haircut", durationMin: 30, price: 38 },
        { name: "Blowout & Style", durationMin: 40, price: 45 },
        { name: "Root Touch-Up Color", durationMin: 90, price: 110 },
        { name: "Full Color", durationMin: 120, price: 150 },
      ],
    },
    {
      slug: "waxing",
      name: "Waxing",
      services: [
        { name: "Eyebrow Shape", durationMin: 15, price: 18 },
        { name: "Lip or Chin", durationMin: 10, price: 12 },
        { name: "Full Leg", durationMin: 45, price: 65 },
        { name: "Bikini", durationMin: 20, price: 35 },
      ],
    },
    {
      slug: "massage",
      name: "Massage",
      services: [
        { name: "Swedish Massage, 60 min", durationMin: 60, price: 95 },
        { name: "Deep Tissue, 60 min", durationMin: 60, price: 110 },
        { name: "Massage, 90 min", durationMin: 90, price: 140 },
      ],
    },
    {
      slug: "facial",
      name: "Facial",
      services: [
        { name: "Signature Facial", durationMin: 60, price: 95 },
        { name: "Express Facial", durationMin: 30, price: 55 },
        { name: "Anti-Aging Facial", durationMin: 75, price: 125 },
      ],
    },
  ];

  for (let i = 0; i < catalog.length; i++) {
    const cat = catalog[i];
    const category = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: i },
      create: { slug: cat.slug, name: cat.name, order: i },
    });

    for (let j = 0; j < cat.services.length; j++) {
      const s = cat.services[j];
      const existing = await prisma.service.findFirst({
        where: { categoryId: category.id, name: s.name },
      });
      if (existing) {
        await prisma.service.update({
          where: { id: existing.id },
          data: { ...s, order: j },
        });
      } else {
        await prisma.service.create({
          data: { ...s, order: j, categoryId: category.id },
        });
      }
    }
  }

  const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { id: "admin" },
    update: { passwordHash },
    create: { id: "admin", passwordHash },
  });

  console.log("Seed complete.");
  console.log(`Admin login password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
