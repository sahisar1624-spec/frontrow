"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const settingsSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  tagline: z.string().trim().optional(),
  aboutText: z.string().trim().optional(),
});

export async function updateSalonSettings(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email") || undefined,
    instagram: formData.get("instagram") || undefined,
    tagline: formData.get("tagline") || undefined,
    aboutText: formData.get("aboutText") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please fill in the salon's name, address, and phone." };
  }

  await prisma.salon.upsert({
    where: { id: "salon" },
    update: parsed.data,
    create: { id: "salon", ...parsed.data },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}
