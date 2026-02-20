# Halaqas (حلقات)

A free community website that aggregates Islamic events across Sydney mosques into a searchable directory with subscribable calendars. Launching for Ramadan 2026.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **Database:** Supabase (PostgreSQL) — accessed via `@supabase/supabase-js`
- **AI parsing:** Groq API (Llama 4 Scout) for flyer/text extraction, Gemini Flash as fallback
- **Hosting:** Cloudflare Pages (auto-deploy from GitHub)
- **Images:** Cloudflare R2 (not yet configured — data URL fallback)
- **Maps:** Leaflet + OpenStreetMap + react-leaflet
- **Prayer times:** Adhan.js (Shafi'i method, Sydney coordinates)
- **Calendars:** Dynamic .ics feed generation per mosque
- No user accounts. Admin is password-protected.

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build (use to verify changes)
- `npm run lint` — ESLint

## Project structure

```
src/
  app/                    # Next.js App Router pages and API routes
    api/                  # All API routes
      admin/              # Admin-only endpoints (auth-gated via isAdmin())
      events/             # Public event CRUD + reporting
      feedback/           # Public feedback submission
      mosques/            # Mosque listing, suggest, nicknames, calendar.ics
      parse-image/        # AI flyer parsing (Groq)
      parse-text/         # AI text parsing (Groq)
      geocode/            # Address geocoding
    admin/                # Admin pages (amendments, events, mosques, feedback)
    contact/              # Contact/feedback form
    submit/               # Event submission (image upload, text paste, manual)
    events/[id]/          # Event detail page
    mosques/              # Mosque directory + map
    about/                # About page
  components/
    layout/               # Header, Footer
    ui/                   # Button, EventCard, EventFilters, MapWrapper, etc.
  lib/
    types.ts              # All TypeScript interfaces and type unions
    supabase.ts           # Supabase client helpers (getServiceClient)
    admin-auth.ts         # isAdmin() helper for admin routes
    prayer-times.ts       # Adhan.js wrapper
    suburbs.ts            # Sydney suburb coordinates for radius filtering
supabase/
  migrations/             # SQL migrations (001–004)
docs/                     # Detailed project documentation (see below)
```

## Key patterns

**API routes** follow this pattern:
- Public: validate input → `getServiceClient()` → Supabase query → return JSON
- Admin: `isAdmin()` guard → same as above
- See `src/app/api/mosques/suggest/route.ts` and `src/app/api/admin/mosques/route.ts` as reference implementations

**Types** live in `src/lib/types.ts` — add new interfaces there, not in individual files.

**Pages** are either server components (static metadata, e.g. `/about`) or client components (`'use client'` for forms/interactivity, e.g. `/submit`, `/admin/*`).

**Styling:**
- Earthy Teal design system — see `docs/07-style-guide.md` for the full spec
- Primary: `#1E5248` (teal), Secondary: `#C4704B` (terracotta)
- Custom Tailwind tokens: `rounded-card`, `rounded-button`, `rounded-pill`, `shadow-card-hover`
- Form inputs use: `text-sm rounded-button border border-sand-dark p-2.5 bg-white text-charcoal placeholder:text-stone`
- Page headings: `text-[28px] font-bold text-charcoal`
- Max content width: `max-w-[900px]` (global), `max-w-xl` or `max-w-2xl` (forms/content pages)

**Adding a new feature** (the "suggestion pattern"):
1. SQL migration in `supabase/migrations/`
2. Type interface in `src/lib/types.ts`
3. Public API route in `src/app/api/`
4. Public-facing page in `src/app/`
5. Admin API route in `src/app/api/admin/`
6. Admin review page in `src/app/admin/`
7. Nav links in Header + Footer + admin dashboard

## Database tables

`mosques`, `events`, `amendments`, `mosque_suggestions`, `feedback` — see `docs/03-technical-architecture.md` and `supabase/migrations/` for schemas.

## Detailed docs

For deeper context, read from `docs/`:

| Doc | Contents |
|-----|----------|
| `01-project-brief.md` | Problem, solution, target community, cost approach |
| `02-prd.md` | User personas, user stories, MVP features, out-of-scope |
| `03-technical-architecture.md` | Full tech stack, DB schema, API routes, AI prompt design |
| `04-mvp-roadmap.md` | Phased milestones with completion status |
| `05-risk-register.md` | Risks and mitigations |
| `06-adoption-outreach-plan.md` | Launch and community outreach strategy |
| `07-style-guide.md` | Complete visual design system (colours, typography, components) |
| `08-session-log.md` | Chronological record of what was built each session |

## End session workflow

When the user says "end session" (or similar), do all of the following and then give a brief summary of what was updated:

1. **Update `docs/04-mvp-roadmap.md`:**
   - Check off completed milestones/tasks (`[ ]` → `[x]`)
   - Add any new tasks that emerged during the session
   - Update effort estimates if understanding has changed

2. **Update `docs/08-session-log.md`:** Add a new entry at the top using this format:
   ```
   ## Session — [DATE]

   ### Completed
   - [What was built or changed]

   ### Decisions Made
   - [Any technical or design decisions]

   ### Issues / Bugs
   - [Anything broken or needing attention]

   ### Next Session
   - [What to work on next, in priority order]

   ### Open Questions
   - [Anything unresolved that needs input]
   ```

3. **Update `docs/03-technical-architecture.md`** if the schema, API routes, or architecture changed.

4. **Update `docs/05-risk-register.md`** if new risks were discovered or existing ones mitigated.

5. **Update any other doc** that has become outdated based on the session's work.
