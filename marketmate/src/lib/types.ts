// Shared types for generated content — safe to import from client components
// (no server-only dependencies like the Anthropic SDK or better-sqlite3 here).

export interface AdVariation {
  headline: string;
  description: string;
}

export interface CalendarDay {
  day: string;
  idea: string;
}

export interface GeneratedContent {
  captions: string[];
  ads: AdVariation[];
  calendar: CalendarDay[];
  blogTitles: string[];
}

export interface HealthCheckSuggestion {
  title: string;
  suggestion: string;
}

export interface HealthCheckResult {
  suggestions: HealthCheckSuggestion[];
}

export interface BusinessInput {
  businessType: string;
  targetAudience: string;
  goal: string;
  businessName?: string;
}
