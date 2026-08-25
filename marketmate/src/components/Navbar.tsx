"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface Me {
  id: number;
  email: string;
}

export default function Navbar() {
  const [user, setUser] = useState<Me | null | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-brand-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white">
            🛍️
          </span>
          MarketMate
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          <Link href="/dashboard" className="text-sm font-medium text-brand-ink hover:text-brand">
            Dashboard
          </Link>
          {user && (
            <Link href="/saved" className="text-sm font-medium text-brand-ink hover:text-brand">
              Saved
            </Link>
          )}
          {user === undefined ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">{user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-brand-ink hover:bg-card"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-brand-ink hover:text-brand">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Sign up free
              </Link>
            </div>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border sm:hidden"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="text-xl leading-none">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="py-1 text-sm font-medium">
              Dashboard
            </Link>
            {user && (
              <Link href="/saved" onClick={() => setMenuOpen(false)} className="py-1 text-sm font-medium">
                Saved content
              </Link>
            )}
            {user ? (
              <>
                <span className="text-sm text-muted">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="py-1 text-sm font-medium">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full bg-brand px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
