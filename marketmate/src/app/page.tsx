import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FEATURES = [
  {
    emoji: "📱",
    title: "Social captions, ready to post",
    body: "5 Instagram & Facebook captions written for your business, your audience, and your goal — not generic filler.",
  },
  {
    emoji: "🎯",
    title: "Ad copy that doesn't sound like an ad",
    body: "3 headline + description variations for Google or Meta ads, so you can test what actually gets clicks.",
  },
  {
    emoji: "🗓️",
    title: "A week of content, planned for you",
    body: "7 days of specific post ideas — no more staring at a blank screen wondering what to post today.",
  },
  {
    emoji: "🔍",
    title: "Blog titles people actually search for",
    body: "5 SEO-friendly blog title ideas tailored to your niche, phrased the way real customers search.",
  },
  {
    emoji: "🩺",
    title: "A free marketing health check",
    body: "Paste your bio or website copy and get 3 specific, no-fluff suggestions to make it work harder.",
  },
  {
    emoji: "💾",
    title: "Save everything, come back anytime",
    body: "Create a free account and every batch of content is saved to your dashboard — no rewriting from scratch.",
  },
];

const STEPS = [
  { n: "1", title: "Tell us about your business", body: "Business type, who you're trying to reach, and what you want right now — more foot traffic, more online sales, whatever it is." },
  { n: "2", title: "Get a full content pack in seconds", body: "Captions, ads, a weekly calendar, and blog ideas — all specific to your business, not copy-paste templates." },
  { n: "3", title: "Post it, save it, tweak it", body: "Use what works, save your favorites, and run a health check on your bio anytime things feel stale." },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand-dark">
              Marketing help, minus the marketing team
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-brand-ink sm:text-5xl">
              You run the business.
              <br className="hidden sm:block" /> Let MarketMate handle the marketing words.
            </h1>
            <p className="mt-5 text-lg text-muted">
              Tell us what your business does, who you&rsquo;re trying to reach, and what you want to happen next.
              MarketMate writes the social posts, ads, content calendar, and blog ideas — in plain, friendly
              language, ready to use today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="w-full rounded-full bg-brand px-8 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-brand/25 hover:bg-brand-dark sm:w-auto"
              >
                Try it free — no signup needed
              </Link>
              <Link
                href="/signup"
                className="w-full rounded-full border border-border bg-card px-8 py-3.5 text-center text-base font-semibold text-brand-ink hover:bg-white sm:w-auto"
              >
                Create a free account
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              No credit card. No marketing degree required. Just answer three questions.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-brand-ink sm:text-3xl">
            Everything you&rsquo;d hire a marketer for — done in a minute
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="text-3xl">{f.emoji}</div>
                <h3 className="mt-3 text-lg font-semibold text-brand-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-card/60 py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-brand-ink sm:text-3xl">How it works</h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="text-center sm:text-left">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-bold text-white sm:mx-0">
                    {s.n}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-brand-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-brand-ink sm:text-3xl">
            Stop staring at a blank caption box.
          </h2>
          <p className="mt-3 text-muted">
            Your next week of marketing content is three questions away.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-full bg-brand px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand/25 hover:bg-brand-dark"
          >
            Get my content pack
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
