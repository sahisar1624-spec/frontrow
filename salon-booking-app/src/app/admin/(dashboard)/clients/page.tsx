import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  const clients = await prisma.client.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query } },
            { phone: { contains: query } },
            { email: { contains: query } },
          ],
        }
      : undefined,
    include: { _count: { select: { appointments: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ink">Clients</h1>
        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search name, phone, or email"
            className="w-64 rounded-sm border border-line bg-paper-soft px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          />
          <button type="submit" className="rounded-sm border border-line px-3 py-2 text-sm text-ink-soft hover:border-primary hover:text-primary">
            Search
          </button>
        </form>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-ink-soft">No clients yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {clients.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/clients/${c.id}`}
                className="flex items-center justify-between gap-4 rounded-sm border border-line bg-paper-soft px-5 py-3 hover:border-primary"
              >
                <div className="min-w-0">
                  <p className="font-display text-base text-ink">{c.name}</p>
                  <p className="text-sm text-ink-soft">
                    {c.phone}
                    {c.email ? ` · ${c.email}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-ink-soft">
                  {c._count.appointments} visit{c._count.appointments === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
