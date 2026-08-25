"use client";

import { useEffect, useState } from "react";
import BusinessForm from "./BusinessForm";
import ResultsPack from "./ResultsPack";
import HealthCheckPanel from "./HealthCheckPanel";
import type { BusinessInput, GeneratedContent } from "@/lib/types";

type Tab = "generate" | "health";

export default function DashboardClient() {
  const [tab, setTab] = useState<Tab>("generate");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);

  const [lastInput, setLastInput] = useState<BusinessInput | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setIsLoggedIn(Boolean(data.user)))
      .catch(() => setIsLoggedIn(false));
  }, []);

  async function handleGenerate(input: BusinessInput) {
    setError(null);
    setLoading(true);
    setContent(null);
    setSaved(false);
    setLastInput(input);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setContent(data.content);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!content || !lastInput) return;
    setSaving(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "generation",
          businessType: lastInput.businessType,
          targetAudience: lastInput.targetAudience,
          goal: lastInput.goal,
          content,
        }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
        Let&rsquo;s write your marketing content
      </h1>
      <p className="mt-2 text-muted">
        Answer three quick questions and get a full content pack, or run a health check on copy you
        already have.
      </p>

      <div className="mt-6 inline-flex rounded-full border border-border bg-card p-1">
        <button
          onClick={() => setTab("generate")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === "generate" ? "bg-brand text-white" : "text-brand-ink hover:bg-brand/10"
          }`}
        >
          Content generator
        </button>
        <button
          onClick={() => setTab("health")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === "health" ? "bg-brand text-white" : "text-brand-ink hover:bg-brand/10"
          }`}
        >
          Health check
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-white/60 p-5 sm:p-8">
        {tab === "generate" ? (
          <>
            <BusinessForm onSubmit={handleGenerate} loading={loading} />
            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            {content && (
              <ResultsPack
                content={content}
                isLoggedIn={isLoggedIn}
                onSave={handleSave}
                saving={saving}
                saved={saved}
              />
            )}
          </>
        ) : (
          <HealthCheckPanel isLoggedIn={isLoggedIn} />
        )}
      </div>
    </div>
  );
}
