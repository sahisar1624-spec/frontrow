import { prisma } from "@/lib/db";

export const SLOT_INTERVAL_MINUTES = 15;
// Don't let clients book a slot that starts less than this many minutes from now.
const BOOKING_LEAD_MINUTES = 30;

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function dayOfWeekFromISODate(isoDate: string): number {
  // isoDate: "2026-09-21" — parsed as a local calendar date, no timezone shifting.
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

type Interval = { start: number; end: number };

function overlaps(a: Interval, b: Interval) {
  return a.start < b.end && b.start < a.end;
}

export async function getAvailableSlots(
  serviceId: string,
  isoDate: string
): Promise<string[]> {
  const [service, workingHour, blockedSlots, appointments] =
    await Promise.all([
      prisma.service.findUnique({ where: { id: serviceId } }),
      prisma.workingHour.findUnique({
        where: { dayOfWeek: dayOfWeekFromISODate(isoDate) },
      }),
      prisma.blockedSlot.findMany({ where: { date: isoDate } }),
      prisma.appointment.findMany({
        where: { date: isoDate, status: "confirmed" },
      }),
    ]);

  if (!service || !workingHour || !workingHour.isOpen) return [];
  if (blockedSlots.some((b) => !b.startTime || !b.endTime)) return []; // whole day blocked

  const duration = service.durationMin;
  const openMin = timeToMinutes(workingHour.openTime);
  const closeMin = timeToMinutes(workingHour.closeTime);

  const busy: Interval[] = [
    ...appointments.map((a) => ({
      start: timeToMinutes(a.startTime),
      end: timeToMinutes(a.endTime),
    })),
    ...blockedSlots
      .filter((b) => b.startTime && b.endTime)
      .map((b) => ({
        start: timeToMinutes(b.startTime as string),
        end: timeToMinutes(b.endTime as string),
      })),
  ];

  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isToday = todayISO === isoDate;
  const earliestMinutesToday = isToday
    ? now.getHours() * 60 + now.getMinutes() + BOOKING_LEAD_MINUTES
    : -Infinity;

  const slots: string[] = [];
  for (
    let start = openMin;
    start + duration <= closeMin;
    start += SLOT_INTERVAL_MINUTES
  ) {
    if (start < earliestMinutesToday) continue;
    const candidate: Interval = { start, end: start + duration };
    const conflict = busy.some((b) => overlaps(candidate, b));
    if (!conflict) slots.push(minutesToTime(start));
  }

  return slots;
}

export async function isSlotAvailable(
  serviceId: string,
  isoDate: string,
  startTime: string
) {
  const slots = await getAvailableSlots(serviceId, isoDate);
  return slots.includes(startTime);
}
