import Link from "next/link";
import { getSalon } from "@/lib/data";
import { logout } from "@/lib/actions/auth";

const NAV = [
  { href: "/admin", label: "Calendar" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/hours", label: "Hours" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const salon = await getSalon();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper-soft">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-lg text-ink">
              {salon.name} <span className="text-ink-soft">· Admin</span>
            </Link>
            <nav className="flex gap-5 text-sm text-ink-soft">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-ink-soft hover:text-primary">
              Log out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
