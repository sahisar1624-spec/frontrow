# MarketMate 🛍️

An AI-powered marketing assistant for small business owners who don't have a
marketing team. Answer three quick questions and get a full content pack —
social captions, ad copy, a weekly content calendar, and blog title ideas —
plus a "Marketing Health Check" that reviews your Instagram bio or website
copy and tells you exactly what to fix.

Built with Next.js (App Router), the Claude API, and SQLite for local storage.

## Features

1. **Landing page** explaining what MarketMate does.
2. **Dashboard** — enter your business type, target audience, and current
   goal (e.g. "get more foot traffic", "sell more online").
3. **AI content generator** that produces, in one request:
   - 5 social media captions (Instagram/Facebook)
   - 3 ad headline + description variations (Google/Meta)
   - A 7-day content calendar
   - 5 SEO-friendly blog title ideas
4. **Marketing Health Check** — paste your bio or website copy and get 3
   specific, non-generic improvement suggestions.
5. **Accounts** (email + password) to save generated content and come back
   to it later.

You can try the content generator and health check without an account —
signing up just lets you save what you generate.

## Tech stack

- **Frontend/backend:** Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **AI:** [Claude API](https://docs.anthropic.com/) via `@anthropic-ai/sdk`,
  model `claude-sonnet-4-6`
- **Storage:** SQLite (via `better-sqlite3`) — a single file at `data/marketmate.db`,
  no external database needed for the MVP
- **Auth:** email + password (bcrypt-hashed), signed JWT session cookie

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your environment variables

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

- `ANTHROPIC_API_KEY` — get one from the [Anthropic Console](https://console.anthropic.com/).
  This is required for the content generator and health check to work.
- `JWT_SECRET` — any long random string, used to sign login session cookies.
  You can generate one with `openssl rand -hex 32`.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite database is
created automatically at `data/marketmate.db` on first run — no setup needed.

### 4. Try it out

- Visit the homepage, then click **"Try it free"** to go straight to the
  dashboard — no account required to generate content.
- Fill in a business type, target audience, and goal, and generate a content
  pack.
- Paste some bio/website copy into the **Health Check** tab for feedback.
- Create a free account to save packs and health checks — they'll show up
  under **Saved**.

## Project structure

```
src/
  app/
    page.tsx              Landing page
    login/, signup/        Auth pages
    dashboard/              Business input form + content generator + health check
    saved/                  Saved content (requires login)
    api/
      auth/                 signup / login / logout / me
      generate/              Calls Claude to build a content pack
      health-check/          Calls Claude to review pasted copy
      saved/                 Save / list / delete saved content
  components/               UI components (dashboard, saved, shared)
  lib/
    claude.ts               Claude API prompts + calls
    db.ts                    SQLite schema + connection
    auth.ts                  Password hashing + session cookies
    types.ts                 Shared content types
```

## Notes for local testing

- Storage is a single SQLite file (`data/marketmate.db`), gitignored — delete
  it any time to reset all users and saved content.
- No `ANTHROPIC_API_KEY` set → the generator and health check return a clear
  error message instead of crashing, so you can still click through the rest
  of the app.
- Passwords must be at least 6 characters; sessions last 30 days.

## Coming next

- Multi-language support (Hindi and other regional languages) for local
  business owners.
