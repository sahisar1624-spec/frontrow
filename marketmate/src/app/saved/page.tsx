import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SavedList, {
  type SavedGeneration,
  type SavedHealthCheck,
} from "@/components/saved/SavedList";
import { getCurrentUser } from "@/lib/auth";
import db, { type GenerationRow, type HealthCheckRow } from "@/lib/db";
import type { GeneratedContent, HealthCheckResult } from "@/lib/types";

export const metadata = { title: "Saved content — MarketMate" };

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const generationRows = db
    .prepare("SELECT * FROM generations WHERE user_id = ? ORDER BY created_at DESC")
    .all(user.id) as GenerationRow[];

  const healthCheckRows = db
    .prepare("SELECT * FROM health_checks WHERE user_id = ? ORDER BY created_at DESC")
    .all(user.id) as HealthCheckRow[];

  const generations: SavedGeneration[] = generationRows.map((g) => ({
    id: g.id,
    businessType: g.business_type,
    targetAudience: g.target_audience,
    goal: g.goal,
    content: JSON.parse(g.content_json) as GeneratedContent,
    createdAt: g.created_at,
  }));

  const healthChecks: SavedHealthCheck[] = healthCheckRows.map((h) => ({
    id: h.id,
    inputText: h.input_text,
    result: JSON.parse(h.suggestions_json) as HealthCheckResult,
    createdAt: h.created_at,
  }));

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <h1 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">Your saved content</h1>
          <p className="mt-2 text-muted">Everything you&rsquo;ve saved from the dashboard, in one place.</p>
          <SavedList generations={generations} healthChecks={healthChecks} />
        </div>
      </main>
      <Footer />
    </>
  );
}
