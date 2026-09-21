import { prisma } from "@/lib/db";

export async function getSalon() {
  const salon = await prisma.salon.findUnique({ where: { id: "salon" } });
  return (
    salon ?? {
      id: "salon",
      name: "Your Salon",
      tagline: null,
      address: "",
      phone: "",
      email: null,
      instagram: null,
      aboutText: null,
    }
  );
}

export async function getServiceCategories() {
  return prisma.serviceCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      services: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getWorkingHours() {
  const hours = await prisma.workingHour.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
  // Ensure all 7 days are present even if unseeded.
  return Array.from({ length: 7 }, (_, day) => {
    const found = hours.find((h) => h.dayOfWeek === day);
    return (
      found ?? {
        id: -day,
        dayOfWeek: day,
        isOpen: false,
        openTime: "09:00",
        closeTime: "18:00",
      }
    );
  });
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatDisplayTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}
