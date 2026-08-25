import Link from "next/link";
import type { GeneratedContent } from "@/lib/types";
import CopyButton from "@/components/CopyButton";

interface ResultsPackProps {
  content: GeneratedContent;
  isLoggedIn: boolean | undefined;
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
}

export default function ResultsPack({
  content,
  isLoggedIn,
  onSave,
  saving,
  saved,
}: ResultsPackProps) {
  return (
    <div className="mt-10 space-y-10">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-xl font-bold text-brand-ink">Your content pack is ready 🎉</h2>
        {isLoggedIn === false ? (
          <Link
            href="/signup"
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand/10"
          >
            Sign up to save this pack
          </Link>
        ) : (
          onSave && (
            <button
              onClick={onSave}
              disabled={saving || saved}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {saved ? "Saved ✓" : saving ? "Saving…" : "Save this pack"}
            </button>
          )
        )}
      </div>

      {/* Captions */}
      <section>
        <h3 className="text-lg font-semibold text-brand-ink">📱 Social captions</h3>
        <p className="text-sm text-muted">Ready to post on Instagram or Facebook.</p>
        <ul className="mt-4 space-y-3">
          {content.captions.map((caption, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{caption}</p>
              <CopyButton text={caption} />
            </li>
          ))}
        </ul>
      </section>

      {/* Ads */}
      <section>
        <h3 className="text-lg font-semibold text-brand-ink">🎯 Ad variations</h3>
        <p className="text-sm text-muted">For Google or Meta (Facebook/Instagram) ads.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {content.ads.map((ad, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                Variation {i + 1}
              </p>
              <p className="mt-2 font-semibold text-brand-ink">{ad.headline}</p>
              <p className="mt-1 text-sm text-muted">{ad.description}</p>
              <div className="mt-3">
                <CopyButton text={`${ad.headline}\n${ad.description}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Calendar */}
      <section>
        <h3 className="text-lg font-semibold text-brand-ink">🗓️ Weekly content calendar</h3>
        <p className="text-sm text-muted">One post idea for every day this week.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {content.calendar.map((day) => (
            <div key={day.day} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">{day.day}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{day.idea}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Blog titles */}
      <section>
        <h3 className="text-lg font-semibold text-brand-ink">🔍 SEO blog title ideas</h3>
        <p className="text-sm text-muted">Phrased the way customers actually search.</p>
        <ul className="mt-4 space-y-2">
          {content.blogTitles.map((title, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <p className="text-sm font-medium text-foreground">{title}</p>
              <CopyButton text={title} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
