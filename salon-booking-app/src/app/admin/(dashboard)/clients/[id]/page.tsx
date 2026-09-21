import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDisplayTime } from "@/lib/data";
import { categoryColor } from "@/lib/category-style";
import { updateClientNotes } from "@/lib/actions/clients";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      appointments: {
        include: { service: { include: { category: true } } },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
      },
    },
  });

  if (!client) notFound();

  const boundUpdateNotes = updateClientNotes.bind(null, client.id);

  return (
    <div>
      <Link href="/admin/clients" className="text-sm text-ink-soft hover:text-primary">
        ← All clients
      </Link>

      <div className="mt-4 mb-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-ink">{client.name}</h1>
          <p className="mt-1 text-sm text-ink-soft">{client.phone}</p>
          {client.email && <p className="text-sm text-ink-soft">{client.email}</p>}
        </div>

        <form action={boundUpdateNotes} className="w-full max-w-sm">
          <label className="flex flex-col gap-1 text-sm text-ink">
            Notes
            <textarea
              name="notes"
              defaultValue={client.notes ?? ""}
              placeholder="Allergies, preferences, anything worth remembering…"
              className="min-h-24 resize-none rounded-sm border border-line bg-paper-soft px-3 py-2.5 text-ink outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-sm border border-line px-4 py-2 text-sm text-ink-soft hover:border-primary hover:text-primary"
          >
            Save notes
          </button>
        </form>
      </div>

      <h2 className="mb-3 font-display text-xl text-ink">Appointments</h2>
      {client.appointments.length === 0 ? (
        <p className="text-sm text-ink-soft">No appointments yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {client.appointments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-4 rounded-sm border border-line bg-paper-soft px-5 py-3"
              style={{
                borderLeft: `3px solid ${a.status === "cancelled" ? "var(--color-line)" : categoryColor(a.service.category.slug)}`,
                opacity: a.status === "cancelled" ? 0.6 : 1,
              }}
            >
              <div>
                <p className="text-sm text-ink">
                  {a.service.name}{" "}
                  {a.status === "cancelled" && <span className="text-xs text-primary">Cancelled</span>}
                </p>
                <p className="text-sm text-ink-soft">
                  {a.date} · {formatDisplayTime(a.startTime)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
