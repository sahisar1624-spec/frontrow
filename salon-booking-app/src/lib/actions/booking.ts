"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  getAvailableSlots,
  isSlotAvailable,
  minutesToTime,
  timeToMinutes,
} from "@/lib/availability";
import { sendBookingConfirmation } from "@/lib/email";

export async function getSlotsForService(serviceId: string, date: string) {
  return getAvailableSlots(serviceId, date);
}

const bookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(5, "Phone is required").max(30),
  email: z.string().trim().email("Enter a valid email"),
  note: z.string().trim().max(500).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export type BookingResult =
  | {
      ok: true;
      confirmation: {
        appointmentId: string;
        serviceName: string;
        date: string;
        startTime: string;
        durationMin: number;
        price: number;
        note?: string;
        salon: { name: string; address: string; phone: string };
      };
    }
  | { ok: false; error: string };

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
  }
  const { serviceId, date, startTime, name, phone, email, note } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return { ok: false, error: "That service is no longer available." };
  }

  const available = await isSlotAvailable(serviceId, date, startTime);
  if (!available) {
    return {
      ok: false,
      error: "Sorry, that time was just taken — please pick another.",
    };
  }

  const endTime = minutesToTime(timeToMinutes(startTime) + service.durationMin);

  const client = await prisma.client.upsert({
    where: { phone },
    update: { name, email },
    create: { name, phone, email },
  });

  const appointment = await prisma.appointment.create({
    data: {
      serviceId,
      clientId: client.id,
      date,
      startTime,
      endTime,
      note: note || null,
      source: "client",
    },
  });

  const salon = await prisma.salon.findUnique({ where: { id: "salon" } });
  const salonInfo = salon
    ? { name: salon.name, address: salon.address, phone: salon.phone }
    : { name: "Our Salon", address: "", phone: "" };

  await sendBookingConfirmation({
    to: email,
    clientName: name,
    serviceName: service.name,
    date,
    startTime,
    durationMin: service.durationMin,
    price: service.price,
    note,
    salon: salonInfo,
  });

  return {
    ok: true,
    confirmation: {
      appointmentId: appointment.id,
      serviceName: service.name,
      date,
      startTime,
      durationMin: service.durationMin,
      price: service.price,
      note,
      salon: salonInfo,
    },
  };
}
