import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { runHealthCheck } from "@/lib/claude";

export async function POST(req: NextRequest) {
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text || text.length < 10) {
    return NextResponse.json(
      { error: "Paste at least a sentence or two of your bio or website copy." },
      { status: 400 }
    );
  }
  if (text.length > 4000) {
    return NextResponse.json(
      { error: "That's a lot of text — please paste under 4,000 characters." },
      { status: 400 }
    );
  }

  try {
    const result = await runHealthCheck(text);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: describeError(error) }, { status: 502 });
  }
}

function describeError(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) {
    return "The server's Claude API key is missing or invalid. Set ANTHROPIC_API_KEY and try again.";
  }
  if (error instanceof Anthropic.RateLimitError) {
    return "Claude is rate-limited right now — please try again in a moment.";
  }
  if (error instanceof Anthropic.APIError) {
    return `Claude API error: ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong running the health check. Please try again.";
}
