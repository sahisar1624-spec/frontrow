"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GeneratedContent, HealthCheckResult } from "@/lib/types";
import ResultsPack from "@/components/dashboard/ResultsPack";

export interface SavedGeneration {
  id: number;
  businessType: string;
  targetAudience: string;
  goal: string;
  content: GeneratedContent;
  createdAt: string;
}

export interface SavedHealthCheck {
  id: number;
  inputText: string;
  result: HealthCheckResult;
  createdAt: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso + "Z").toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function SavedList({
  generations,
  healthChecks,
}: {
  generations: SavedGeneration[];
  healthChecks: SavedHealthCheck[];
}) {
  const [gens, setGens] = useState(generations);
  const [checks, setChecks] = useState(healthChecks);
  const router = useRouter();

  async function deleteItem(id: number, type: "generation" | "health_check") {
    const res = await fetch(`/api/saved/${id}?type=${type}`, { method: "DELETE" });
    if (!res.ok) return;
    if (type === "generation") {
      setGens((g) => g.filter((x) => x.id !== id));
    } else {
      setChecks((c) => c.filter((x) => x.id !== id));
    }
    router.refresh();
  }

  const isEmpty = gens.length === 0 && checks.length === 0;

  if (isEmpty) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-lg font-semibold text-brand-ink">Nothing saved yet</p>
        <p className="mt-2 text-sm text-muted">
          Generate a content pack or run a health check on your dashboard, then hit &ldquo;Save&rdquo; to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-10">
      {gens.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-brand-ink">Saved content packs</h2>
          <div className="mt-4 space-y-4">
            {gens.map((g) => (
              <details
                key={g.id}
                className="group rounded-2xl border border-border bg-card p-5 open:pb-6"
              >
                <summary className="flex cursor-pointer list-none flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-brand-ink">
                      {g.businessType} · {g.goal}
                    </p>
                    <p className="text-sm text-muted">
                      For {g.targetAudience} — saved {formatDate(g.createdAt)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-3 sm:mt-0">
                    <span className="text-sm font-medium text-brand group-open:hidden">View</span>
                    <span className="hidden text-sm font-medium text-brand group-open:inline">
                      Hide
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteItem(g.id, "generation");
                      }}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted hover:bg-red-50 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </summary>
                <ResultsPack content={g.content} isLoggedIn={true} />
              </details>
            ))}
          </div>
        </section>
      )}

      {checks.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-brand-ink">Saved health checks</h2>
          <div className="mt-4 space-y-4">
            {checks.map((c) => (
              <details
                key={c.id}
                className="group rounded-2xl border border-border bg-card p-5 open:pb-6"
              >
                <summary className="flex cursor-pointer list-none flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-brand-ink line-clamp-1">
                      {c.inputText.slice(0, 70)}
                      {c.inputText.length > 70 ? "…" : ""}
                    </p>
                    <p className="text-sm text-muted">saved {formatDate(c.createdAt)}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-3 sm:mt-0">
                    <span className="text-sm font-medium text-brand group-open:hidden">View</span>
                    <span className="hidden text-sm font-medium text-brand group-open:inline">
                      Hide
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteItem(c.id, "health_check");
                      }}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted hover:bg-red-50 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </summary>
                <ol className="mt-4 space-y-3">
                  {c.result.suggestions.map((s, i) => (
                    <li key={i} className="rounded-xl border border-border bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">
                        {i + 1}. {s.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{s.suggestion}</p>
                    </li>
                  ))}
                </ol>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
