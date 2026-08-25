import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { generateMarketingContent } from "@/lib/claude";

export async function POST(req: NextRequest) {
  let body: {
    businessType?: string;
    targetAudience?: string;
    goal?: string;
    businessName?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const businessType = body.businessType?.trim();
  const targetAudience = body.targetAudience?.trim();
  const goal = body.goal?.trim();
  const businessName = body.businessName?.trim();

  if (!businessType || !targetAudience || !goal) {
    return NextResponse.json(
      { error: "Business type, target audience, and goal are all required." },
      { status: 400 }
    );
  }

  try {
    const content = await generateMarketingContent({
      businessType,
      targetAudience,
      goal,
      businessName: businessName || undefined,
    });
    return NextResponse.json({ content });
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
  return "Something went wrong generating content. Please try again.";
}
