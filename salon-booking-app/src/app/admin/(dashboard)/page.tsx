import Link from "next/link";
import { prisma } from "@/lib/db";
import { AppointmentsPanel } from "@/components/admin/AppointmentsPanel";

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(iso: string, days: number) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

function weekDatesFor(iso: string) {
  const d = parseISO(iso);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return isoDate(day);
  });
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "week" ? "week" : "day";
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : isoDate(new Date());

  const weekDates = view === "week" ? weekDatesFor(date) : [];
  const dateFilter =
    view === "week" ? { in: weekDates } : date;

  const [appointments, services] = await Promise.all([
    prisma.appointment.findMany({
      where: { date: dateFilter },
      include: { service: { include: { category: true } }, client: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.service.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    }),
  ]);

  const serviceOptions = services.map((s) => ({
    id: s.id,
    name: s.name,
    durationMin: s.durationMin,
    categoryName: s.category.name,
  }));

  const prevHref =
    view === "week"
      ? `/admin?view=week&date=${addDays(date, -7)}`
      : `/admin?view=day&date=${addDays(date, -1)}`;
  const nextHref =
    view === "week"
      ? `/admin?view=week&date=${addDays(date, 7)}`
      : `/admin?view=day&date=${addDays(date, 1)}`;

  const heading =
    view === "week"
      ? `Week of ${parseISO(weekDates[0]).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
      : parseISO(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{heading}</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href={prevHref} className="rounded-sm border border-line px-3 py-1.5 text-ink-soft hover:border-primary hover:text-primary">
            ← Prev
          </Link>
          <Link
            href={`/admin?view=${view}&date=${isoDate(new Date())}`}
            className="rounded-sm border border-line px-3 py-1.5 text-ink-soft hover:border-primary hover:text-primary"
          >
            Today
          </Link>
          <Link href={nextHref} className="rounded-sm border border-line px-3 py-1.5 text-ink-soft hover:border-primary hover:text-primary">
            Next →
          </Link>
          <span className="mx-1 text-line">|</span>
          <Link
            href={`/admin?view=day&date=${date}`}
            className="rounded-sm px-3 py-1.5"
            style={{
              background: view === "day" ? "var(--color-primary)" : "transparent",
              color: view === "day" ? "var(--color-paper-soft)" : "var(--color-ink-soft)",
              border: `1px solid ${view === "day" ? "var(--color-primary)" : "var(--color-line)"}`,
            }}
          >
            Day
          </Link>
          <Link
            href={`/admin?view=week&date=${date}`}
            className="rounded-sm px-3 py-1.5"
            style={{
              background: view === "week" ? "var(--color-primary)" : "transparent",
              color: view === "week" ? "var(--color-paper-soft)" : "var(--color-ink-soft)",
              border: `1px solid ${view === "week" ? "var(--color-primary)" : "var(--color-line)"}`,
            }}
          >
            Week
          </Link>
        </div>
      </div>

      <AppointmentsPanel
        appointments={appointments}
        services={serviceOptions}
        view={view}
        date={date}
        weekDates={weekDates}
      />
    </div>
  );
}
