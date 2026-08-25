import Anthropic from "@anthropic-ai/sdk";
import type {
  AdVariation,
  BusinessInput,
  CalendarDay,
  GeneratedContent,
  HealthCheckResult,
  HealthCheckSuggestion,
} from "./types";

export type {
  AdVariation,
  BusinessInput,
  CalendarDay,
  GeneratedContent,
  HealthCheckResult,
  HealthCheckSuggestion,
};

const MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

/**
 * Claude's replies are asked to be pure JSON, but models sometimes wrap
 * output in ```json fences or add a stray sentence. Pull out the first
 * balanced {...} block and parse that.
 */
function extractJson<T>(raw: string): T {
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Claude did not return JSON we could parse.");
  }
  const jsonSlice = text.slice(start, end + 1);
  return JSON.parse(jsonSlice) as T;
}

function getResponseText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

export async function generateMarketingContent(
  input: BusinessInput
): Promise<GeneratedContent> {
  const { businessType, targetAudience, goal, businessName } = input;

  const system = `You are MarketMate, a friendly marketing assistant built for small business owners who have no marketing team and no time to waste. You write specific, concrete, business-appropriate copy - never generic filler like "Check us out!" or "Quality you can trust." Every piece of content must reference real, specific details about the business type, its target audience, or its stated goal. Match the tone to the business (playful for a bakery, more polished for a law office, etc.). You always respond with a single valid JSON object and nothing else - no markdown fences, no commentary before or after.`;

  const businessLabel = businessName
    ? `${businessName} (a ${businessType})`
    : businessType;

  const user = `Generate a marketing content pack for this small business:

- Business: ${businessLabel}
- Target audience: ${targetAudience}
- Main goal right now: ${goal}

Return ONLY a JSON object with this exact shape:

{
  "captions": [5 strings — Instagram/Facebook post captions, each 1-3 sentences, tailored to this business and goal. Include relevant emoji sparingly and natural hashtag suggestions inline where they fit. Vary the angle across the 5 (e.g. behind the scenes, customer benefit, offer/urgency, community, social proof)],
  "ads": [3 objects with "headline" (under 30 characters, punchy) and "description" (under 90 characters) — for Google/Meta ads, each testing a different hook or benefit],
  "calendar": [7 objects with "day" ("Monday" through "Sunday") and "idea" (one concrete, specific post idea for that day — format/content type + topic, not just a theme word)],
  "blogTitles": [5 strings — SEO-friendly blog post title ideas for this business's niche, phrased the way a real customer would search]
}

Make everything specific to a ${businessType} whose audience is ${targetAudience} and whose goal is "${goal}". Do not use placeholder brackets or generic phrases - write it as if you know this exact business.`;

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = getResponseText(response);
  const parsed = extractJson<GeneratedContent>(text);

  if (
    !Array.isArray(parsed.captions) ||
    !Array.isArray(parsed.ads) ||
    !Array.isArray(parsed.calendar) ||
    !Array.isArray(parsed.blogTitles)
  ) {
    throw new Error("Claude's response was missing expected fields.");
  }

  return parsed;
}

export async function runHealthCheck(
  copyText: string
): Promise<HealthCheckResult> {
  const system = `You are MarketMate's Marketing Health Check. A small business owner pastes their Instagram bio or website copy, and you give sharp, specific, actionable feedback - never vague encouragement. You always respond with a single valid JSON object and nothing else - no markdown fences, no commentary before or after.`;

  const user = `Here is the current marketing copy (Instagram bio or website text) from a small business:

"""
${copyText}
"""

Give exactly 3 specific improvement suggestions. For each one, identify a concrete problem in THIS copy (quote or reference the actual words when useful) and a concrete fix - not generic marketing advice. Prioritize the highest-impact changes first (e.g. missing call to action, unclear what the business does, no reason to choose them over a competitor, weak/no offer, no location or contact path if relevant).

Return ONLY a JSON object with this exact shape:

{
  "suggestions": [3 objects with "title" (a short 3-6 word label for the issue) and "suggestion" (2-3 sentences: what's wrong specifically, and exactly what to write or change instead - give a real rewritten example when possible)]
}`;

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = getResponseText(response);
  const parsed = extractJson<HealthCheckResult>(text);

  if (!Array.isArray(parsed.suggestions)) {
    throw new Error("Claude's response was missing expected fields.");
  }

  return parsed;
}
