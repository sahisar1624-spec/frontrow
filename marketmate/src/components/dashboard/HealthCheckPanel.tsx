"use client";

import Link from "next/link";
import { useState } from "react";
import type { HealthCheckResult } from "@/lib/types";

interface HealthCheckPanelProps {
  isLoggedIn: boolean | undefined;
}

export default function HealthCheckPanel({ isLoggedIn }: HealthCheckPanelProps) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit() {
    if (text.trim().length < 10) {
      setError("Paste at least a sentence or two of your bio or website copy.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    setSaved(false);
    try {
      const res = await fetch("/api/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data.result);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "health_check", inputText: text.trim(), result }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-brand-ink">🩺 Marketing health check</h2>
      <p className="mt-1 text-sm text-muted">
        Paste your Instagram bio or a chunk of your website copy — we&rsquo;ll tell you exactly what to fix.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        maxLength={4000}
        placeholder="Paste your Instagram bio or website copy here…"
        className="mt-4 w-full rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      <div className="mt-1 text-right text-xs text-muted">{text.length}/4000</div>

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-3 w-full rounded-full bg-brand px-6 py-3 text-base font-semibold text-white hover:bg-brand-dark disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Checking…" : "Run health check"}
      </button>

      {result && (
        <div className="mt-8">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="text-lg font-semibold text-brand-ink">Here&rsquo;s what to fix</h3>
            {isLoggedIn === false ? (
              <Link
                href="/signup"
                className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand/10"
              >
                Sign up to save this
              </Link>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {saved ? "Saved ✓" : saving ? "Saving…" : "Save this check"}
              </button>
            )}
          </div>

          <ol className="mt-4 space-y-4">
            {result.suggestions.map((s, i) => (
              <li key={i} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">
                  {i + 1}. {s.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{s.suggestion}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
