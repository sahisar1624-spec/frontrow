import { NextRequest, NextResponse } from "next/server";
import db, { type GenerationRow, type HealthCheckRow } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { GeneratedContent, HealthCheckResult } from "@/lib/claude";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to view saved content." }, { status: 401 });
  }

  const generations = db
    .prepare(
      "SELECT * FROM generations WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(user.id) as GenerationRow[];

  const healthChecks = db
    .prepare(
      "SELECT * FROM health_checks WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(user.id) as HealthCheckRow[];

  return NextResponse.json({
    generations: generations.map((g) => ({
      id: g.id,
      businessType: g.business_type,
      targetAudience: g.target_audience,
      goal: g.goal,
      content: JSON.parse(g.content_json) as GeneratedContent,
      createdAt: g.created_at,
    })),
    healthChecks: healthChecks.map((h) => ({
      id: h.id,
      inputText: h.input_text,
      result: JSON.parse(h.suggestions_json) as HealthCheckResult,
      createdAt: h.created_at,
    })),
  });
}

interface SaveGenerationBody {
  type: "generation";
  businessType: string;
  targetAudience: string;
  goal: string;
  content: GeneratedContent;
}

interface SaveHealthCheckBody {
  type: "health_check";
  inputText: string;
  result: HealthCheckResult;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to save content." }, { status: 401 });
  }

  let body: SaveGenerationBody | SaveHealthCheckBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.type === "generation") {
    if (!body.businessType || !body.targetAudience || !body.goal || !body.content) {
      return NextResponse.json({ error: "Missing fields to save." }, { status: 400 });
    }
    const result = db
      .prepare(
        `INSERT INTO generations (user_id, business_type, target_audience, goal, content_json)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        user.id,
        body.businessType,
        body.targetAudience,
        body.goal,
        JSON.stringify(body.content)
      );
    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  }

  if (body.type === "health_check") {
    if (!body.inputText || !body.result) {
      return NextResponse.json({ error: "Missing fields to save." }, { status: 400 });
    }
    const result = db
      .prepare(
        `INSERT INTO health_checks (user_id, input_text, suggestions_json)
         VALUES (?, ?, ?)`
      )
      .run(user.id, body.inputText, JSON.stringify(body.result));
    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  }

  return NextResponse.json({ error: "Unknown save type." }, { status: 400 });
}
