import { DAY_NAMES_SHORT, formatDisplayTime } from "@/lib/data";
import type { WorkingHour } from "@prisma/client";

function getOpenStatus(hours: WorkingHour[]) {
  const now = new Date();
  const today = hours.find((h) => h.dayOfWeek === now.getDay());
  if (!today || !today.isOpen) return { open: false, label: "Closed today" };

  const [oh, om] = today.openTime.split(":").map(Number);
  const [ch, cm] = today.closeTime.split(":").map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;

  if (nowMin >= openMin && nowMin < closeMin) {
    return { open: true, label: `Open until ${formatDisplayTime(today.closeTime)}` };
  }
  if (nowMin < openMin) {
    return { open: false, label: `Opens today at ${formatDisplayTime(today.openTime)}` };
  }
  return { open: false, label: "Closed for today" };
}

export function Hero({
  name,
  tagline,
  address,
  phone,
  hours,
}: {
  name: string;
  tagline: string | null;
  address: string;
  phone: string;
  hours: WorkingHour[];
}) {
  const status = getOpenStatus(hours);

  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* Organic swatch backdrop — the one big visual moment on the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <svg
          className="absolute -right-24 -top-24 h-[26rem] w-[26rem] opacity-90 md:-right-16 md:-top-32 md:h-[34rem] md:w-[34rem]"
          viewBox="0 0 200 200"
        >
          <circle cx="100" cy="100" r="100" fill="var(--color-nails)" opacity="0.16" />
        </svg>
        <svg
          className="absolute -left-16 top-24 h-56 w-56 opacity-90 md:top-40 md:h-72 md:w-72"
          viewBox="0 0 200 200"
        >
          <circle cx="100" cy="100" r="100" fill="var(--color-massage)" opacity="0.18" />
        </svg>
        <svg
          className="absolute left-1/3 -bottom-20 h-64 w-64 opacity-90"
          viewBox="0 0 200 200"
        >
          <circle cx="100" cy="100" r="100" fill="var(--color-waxing)" opacity="0.14" />
        </svg>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 pb-14 pt-16 md:pb-20 md:pt-24">
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: status.open ? "var(--color-massage)" : "var(--color-ink-soft)" }}
          />
          {status.label}
        </div>

        <h1 className="font-display text-5xl leading-[1.05] text-ink md:text-6xl">
          {name}
        </h1>

        {tagline && (
          <p className="max-w-md text-lg text-ink-soft">{tagline}</p>
        )}

        <div className="mt-2 flex flex-col gap-1 text-sm text-ink-soft">
          <span>{address}</span>
          <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="w-fit underline decoration-line underline-offset-4 hover:decoration-primary">
            {phone}
          </a>
        </div>

        <div className="mt-4">
          <a
            href="#services"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-7 py-3.5 font-display text-lg text-paper-soft shadow-sm transition-colors hover:bg-primary-dark"
          >
            Book a visit
          </a>
        </div>
      </div>
    </section>
  );
}

export function HoursStrip({ hours }: { hours: WorkingHour[] }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft">
      {hours.map((h) => (
        <span key={h.dayOfWeek}>
          <span className="text-ink">{DAY_NAMES_SHORT[h.dayOfWeek]}</span>{" "}
          {h.isOpen
            ? `${formatDisplayTime(h.openTime)} – ${formatDisplayTime(h.closeTime)}`
            : "Closed"}
        </span>
      ))}
    </div>
  );
}
