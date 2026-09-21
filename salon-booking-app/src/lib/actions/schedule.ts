"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const DAY_COUNT = 7;

export async function updateWorkingHours(formData: FormData) {
  await requireAdmin();

  for (let day = 0; day < DAY_COUNT; day++) {
    const isOpen = formData.get(`isOpen-${day}`) === "on";
    const openTime = String(formData.get(`openTime-${day}`) || "09:00");
    const closeTime = String(formData.get(`closeTime-${day}`) || "18:00");

    await prisma.workingHour.upsert({
      where: { dayOfWeek: day },
      update: { isOpen, openTime, closeTime },
      create: { dayOfWeek: day, isOpen, openTime, closeTime },
    });
  }

  revalidatePath("/admin/hours");
  revalidatePath("/");
}

const blockSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().optional(),
});

export async function addBlockedSlot(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const wholeDay = formData.get("wholeDay") === "on";
  const parsed = blockSchema.safeParse({
    date: formData.get("date"),
    startTime: wholeDay ? undefined : String(formData.get("startTime") || ""),
    endTime: wholeDay ? undefined : String(formData.get("endTime") || ""),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) return { error: "Pick a valid date." };

  const { date, startTime, endTime, reason } = parsed.data;
  if (!wholeDay && (!startTime || !endTime)) {
    return { error: "Add a start and end time, or block the whole day." };
  }

  await prisma.blockedSlot.create({
    data: {
      date,
      startTime: wholeDay ? null : startTime,
      endTime: wholeDay ? null : endTime,
      reason: reason || null,
    },
  });

  revalidatePath("/admin/hours");
  revalidatePath("/");
  return { error: undefined, success: true };
}

export async function removeBlockedSlot(id: string) {
  await requireAdmin();
  await prisma.blockedSlot.delete({ where: { id } });
  revalidatePath("/admin/hours");
  revalidatePath("/");
}
