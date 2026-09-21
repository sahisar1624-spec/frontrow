import { prisma } from "@/lib/db";
import { getWorkingHours, DAY_NAMES } from "@/lib/data";
import { updateWorkingHours, removeBlockedSlot } from "@/lib/actions/schedule";
import { AddBlockedSlotForm } from "@/components/admin/AddBlockedSlotForm";

export const dynamic = "force-dynamic";

export default async function HoursPage() {
  const hours = await getWorkingHours();
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const blockedSlots = await prisma.blockedSlot.findMany({
    where: { date: { gte: todayISO } },
    orderBy: [{ date: "asc" }],
  });

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h1 className="mb-6 font-display text-3xl text-ink">Working hours</h1>
        <form action={updateWorkingHours} className="flex flex-col gap-3">
          {hours.map((h) => (
            <div
              key={h.dayOfWeek}
              className="flex flex-wrap items-center gap-4 rounded-sm border border-line bg-paper-soft px-5 py-3"
            >
              <label className="flex w-32 items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  name={`isOpen-${h.dayOfWeek}`}
                  defaultChecked={h.isOpen}
                />
                {DAY_NAMES[h.dayOfWeek]}
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                Open
                <input
                  type="time"
                  name={`openTime-${h.dayOfWeek}`}
                  defaultValue={h.openTime}
                  className="rounded-sm border border-line bg-paper px-2 py-1.5 text-ink outline-none focus:border-primary"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                Close
                <input
                  type="time"
                  name={`closeTime-${h.dayOfWeek}`}
                  defaultValue={h.closeTime}
                  className="rounded-sm border border-line bg-paper px-2 py-1.5 text-ink outline-none focus:border-primary"
                />
              </label>
            </div>
          ))}
          <button
            type="submit"
            className="mt-2 self-start rounded-sm bg-primary px-5 py-2.5 text-sm text-paper-soft hover:bg-primary-dark"
          >
            Save hours
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-6 font-display text-3xl text-ink">Blocked time</h2>
        <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
          <AddBlockedSlotForm />

          <div>
            {blockedSlots.length === 0 ? (
              <p className="text-sm text-ink-soft">Nothing blocked off right now.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {blockedSlots.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-4 rounded-sm border border-line bg-paper-soft px-5 py-3"
                  >
                    <div>
                      <p className="text-sm text-ink">
                        {b.date} {b.startTime ? `· ${b.startTime}–${b.endTime}` : "· all day"}
                      </p>
                      {b.reason && <p className="text-sm text-ink-soft">{b.reason}</p>}
                    </div>
                    <form action={removeBlockedSlot.bind(null, b.id)}>
                      <button type="submit" className="text-sm text-ink-soft hover:text-primary">
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
