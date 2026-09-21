"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { minutesToTime, timeToMinutes } from "@/lib/availability";

const appointmentSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().trim().min(1),
  phone: z.string().trim().min(5),
  email: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export async function createAppointmentAdmin(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const parsed = appointmentSchema.safeParse({
    serviceId: formData.get("serviceId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please fill in the required fields." };
  }
  const { serviceId, date, startTime, name, phone, email, note } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return { error: "Pick a service." };

  const endTime = minutesToTime(timeToMinutes(startTime) + service.durationMin);

  const overlapping = await prisma.appointment.findFirst({
    where: {
      date,
      status: "confirmed",
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });
  if (overlapping) {
    return { error: "That time overlaps an existing appointment." };
  }

  const client = await prisma.client.upsert({
    where: { phone },
    update: { name, email: email || undefined },
    create: { name, phone, email: email || null },
  });

  await prisma.appointment.create({
    data: {
      serviceId,
      clientId: client.id,
      date,
      startTime,
      endTime,
      note: note || null,
      source: "admin",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  return { error: undefined, success: true };
}

const updateSchema = appointmentSchema.extend({
  id: z.string().min(1),
});

export async function updateAppointment(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    serviceId: formData.get("serviceId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please fill in the required fields." };
  }
  const { id, serviceId, date, startTime, name, phone, email, note } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return { error: "Pick a service." };

  const endTime = minutesToTime(timeToMinutes(startTime) + service.durationMin);

  const overlapping = await prisma.appointment.findFirst({
    where: {
      id: { not: id },
      date,
      status: "confirmed",
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });
  if (overlapping) {
    return { error: "That time overlaps an existing appointment." };
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) return { error: "Appointment not found." };

  const client = await prisma.client.upsert({
    where: { phone },
    update: { name, email: email || undefined },
    create: { name, phone, email: email || null },
  });

  await prisma.appointment.update({
    where: { id },
    data: {
      serviceId,
      clientId: client.id,
      date,
      startTime,
      endTime,
      note: note || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  return { error: undefined, success: true };
}

export async function cancelAppointment(id: string) {
  await requireAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: "cancelled" },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/clients");
}

export async function restoreAppointment(id: string) {
  await requireAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: "confirmed" },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/clients");
}

export async function deleteAppointment(id: string) {
  await requireAdmin();
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/admin/clients");
}
