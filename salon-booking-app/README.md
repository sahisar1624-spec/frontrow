# Petal & Palm — salon booking app

A two-part booking app for a small salon: a client-facing booking page (no account,
no payment) and a password-protected admin dashboard for managing appointments,
hours, clients, and the salon's own contact info.

Everything in this repo right now — the salon name, address, hours, and service
list/prices — is **placeholder demo content**. Swap it for the real thing either
by editing it live in Admin → Settings / Hours once the app is running, or by
editing `prisma/seed.ts` and re-running `npm run db:seed`.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- [Prisma](https://www.prisma.io) + SQLite (swap to Postgres/Supabase by changing
  the `datasource` provider and `DATABASE_URL` — the rest of the code doesn't change)
- [Resend](https://resend.com) for confirmation emails (optional — booking still
  works without it, it just skips the email and logs to the console)
- Tailwind CSS v4

## Getting started

```bash
npm install
cp .env.example .env   # then fill in a real ADMIN_PASSWORD and JWT_SECRET
npx prisma migrate dev --name init   # only needed if prisma/dev.db doesn't exist yet
npm run db:seed
npm run dev
```

Open http://localhost:3000 for the booking page, and http://localhost:3000/admin
for the dashboard (password is whatever you set as `ADMIN_PASSWORD` before seeding —
the seed script hashes it into the database; changing `ADMIN_PASSWORD` later requires
re-running `npm run db:seed`).

## Environment variables

| Variable          | Required | Notes                                                              |
| ------------------ | -------- | -------------------------------------------------------------------- |
| `DATABASE_URL`     | Yes      | `file:./dev.db` for SQLite locally.                                  |
| `ADMIN_PASSWORD`   | Yes      | Used by `npm run db:seed` to set the admin login password.           |
| `JWT_SECRET`       | Yes      | Long random string, signs the admin session cookie.                  |
| `RESEND_API_KEY`   | No       | If unset, confirmation emails are skipped (logged instead of sent).  |
| `EMAIL_FROM`       | No       | Sender shown on confirmation emails.                                 |

## Project structure

```
prisma/schema.prisma        Data model (Salon, WorkingHour, BlockedSlot,
                             ServiceCategory, Service, Client, Appointment, AdminUser)
prisma/seed.ts               Placeholder salon/services/hours + admin password
src/proxy.ts                 Gates /admin/* behind the login session cookie
src/lib/
  db.ts                      Prisma client
  auth.ts                    Session cookie signing/verification (jose)
  availability.ts             Open-slot calculation (hours − bookings − blocks)
  email.ts                    Confirmation email (Resend)
  data.ts                     Shared read helpers (salon, services, hours)
  actions/                    Server Actions — booking, auth, appointments,
                               schedule (hours/blocks), clients, settings
src/components/
  booking/                    Hero, service "swatch" picker, booking modal
  admin/                      Appointment form/list, blocked-time form, settings form
src/app/
  page.tsx                    Client-facing booking page
  admin/login                 Admin login (outside the auth gate)
  admin/(dashboard)/          Calendar, clients, hours, settings — all behind the gate
```

## How booking works

Clients never see a raw calendar grid — they pick a service, then a day, then one
of the open time slots computed from: the salon's working hours for that weekday,
minus any admin-blocked time, minus already-booked appointments (with the
service's own duration). No slot within the next 30 minutes is offered, and a
slot is re-validated server-side at submit time in case two people were looking
at the same opening.

## Deploying

The cheapest path: [Vercel](https://vercel.com) for the app, plus a hosted SQLite
database since Vercel's filesystem isn't persistent between deploys:

1. Swap SQLite for a hosted equivalent — either
   [Turso](https://turso.tech) (libSQL, same query semantics as SQLite; needs the
   `@libsql/client` Prisma driver adapter) or point `DATABASE_URL` at a Postgres
   instance (e.g. [Supabase](https://supabase.com)) and change
   `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`.
2. Set `DATABASE_URL`, `ADMIN_PASSWORD`-derived hash (run the seed script once
   against the production database), `JWT_SECRET`, and optionally
   `RESEND_API_KEY`/`EMAIL_FROM` as project environment variables.
3. `vercel deploy`, or connect the repo in the Vercel dashboard.

Any other Node host (Render, Railway, Fly.io) works too and can keep SQLite as-is
since those platforms offer a persistent disk — just run `npx prisma migrate deploy`
and `npm run db:seed` once during setup.

## What's intentionally out of scope

- Payments — the brief calls for no payment at booking, so there's none.
- Multiple staff/stylists or per-staff schedules — one shared calendar for the
  whole salon.
- Editing services/prices from the dashboard — for now that's done by editing
  `prisma/seed.ts` and re-seeding. Straightforward to add a Services admin page
  later using the same pattern as Hours/Settings if it turns out to be needed.
