"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm rounded-sm border border-line bg-paper-soft p-8">
        <p className="font-display text-sm text-primary">Staff only</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-soft">Enter the studio password to manage bookings.</p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-ink">
            Password
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="rounded-sm border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-primary"
            />
          </label>

          {state?.error && <p className="text-sm text-primary">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-sm bg-primary px-4 py-2.5 text-sm text-paper-soft transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {pending ? "Checking…" : "Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}
