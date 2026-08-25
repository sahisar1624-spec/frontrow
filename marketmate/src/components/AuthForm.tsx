"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isSignup = mode === "signup";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-brand-ink">
          {isSignup ? "Create your free account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isSignup
            ? "Save your generated content and pick up right where you left off."
            : "Log in to see your saved captions, ads, and calendars."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="you@yourbusiness.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand px-6 py-3 text-base font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-brand hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              New to MarketMate?{" "}
              <Link href="/signup" className="font-medium text-brand hover:underline">
                Create a free account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
