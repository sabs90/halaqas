# Halaqas — Session Log

This file is the persistent memory between Claude Code sessions. Each entry summarises what was built, what changed, and what's next. Read from top (most recent) to bottom (oldest).

---

## Session 4 — AI Prompt Refinement, Real Event Seeding, ICS Fixes (2026-02-20)

### Completed
- **AI flyer parsing prompt refinement:** Created `scripts/test-parse-flyers.mjs` test harness to systematically test the Groq prompt against 8 real flyers. Iterated through 4+ prompt rounds fixing: multi-event extraction, prayer-anchored time rules, mosque name detection, Ramadan date context, skip rules for non-events. Verified all 8 flyers with user, saved golden baselines to `scripts/flyer-expected.json`. Ported final prompt to production `src/lib/groq.ts`.
- **New event types:** Added `tahajjud`, `itikaf`, `competition`, `workshop` to EventType across the entire stack (types, DB migration 005, UI components, filters, submit page, prompts).
- **Multi-event support:** Added `parseImageWithGroqMulti()`, `extractAllEvents()`, and `backfillRecurrenceEndDate()` post-processing to `groq.ts`.
- **Real event seeding:** Replaced all 12 dummy events with 28 real events from 8 verified flyers. Added 2 new mosques (Australian Islamic House, Dar Ibn Abbas). Updated `scripts/seed-events.mjs` to read from `scripts/flyer-expected.json` and map flyer data to DB schema.
- **ICS calendar fixes (major):**
  - Fixed missing `VTIMEZONE` definition — Apple Calendar was displaying UTC times as local. Added full Australia/Sydney VTIMEZONE block with AEST/AEDT DST rules.
  - Fixed `formatSydneyLocal()` — now uses `Intl.DateTimeFormat` with explicit `timeZone: 'Australia/Sydney'` instead of system-local `getHours()`.
  - Fixed recurring events with no `fixed_date` — `getStartDateForPattern()` picks the correct next day-of-week instead of defaulting to today.
  - Fixed date-only events (no time) — rendered as ICS all-day events (`DTSTART;VALUE=DATE`) instead of being skipped.
  - Fixed `AddToCalendarButton.tsx` — invalid date from double-appended seconds (`19:15:00:00`), missing prayer-anchored support, same VTIMEZONE/UTC issues.
  - Changed default event duration from 60min to 30min (10min for "short" talks).
  - Removed aggressive 1hr Cache-Control header from calendar endpoint during dev.
- **Filter UX reorganisation:** Grouped event type pills into logical categories (Learning | Prayer | Community) with dividers. Added small uppercase labels for Gender and Language groups.
- **ICS description footer:** Added "Via halaqas.com — Australian Islamic events directory" to all calendar event descriptions.

### Decisions Made
- `tahajjud` is a separate event type from `taraweeh` (different prayer, different time)
- `itikaf` kept as extractable type for filtering, even though user may want to exclude from public display
- Prayer Cards and similar take-home activities are NOT events (LLM limitation — still extracted sometimes, accepted)
- `backfillRecurrenceEndDate()` post-processing compensates for LLM not applying Ramadan end dates to all sibling events
- ICS uses `VTIMEZONE` + `TZID=Australia/Sydney` (not UTC Z-suffix) for proper timezone display in Apple Calendar
- Calendar event duration: 30min default, 10min for events with "short" in title
- Lebanese Muslim Association events map to existing Lakemba Mosque with venue override for street address

### Issues / Bugs
- Apple Calendar aggressively caches subscribed calendars — changes may take hours to appear. Workaround: delete and re-subscribe.
- LLM still sometimes sets `prayer_anchor` alongside a specific clock time (accepted limitation)
- LLM still sometimes extracts non-events like Prayer Cards (accepted limitation)

### Next Session
- Set up Cloudflare Pages for auto-deploy from GitHub
- Set up Cloudflare R2 bucket and configure credentials
- Generate PWA icons
- QA pass: test all flows on mobile (especially calendar add/subscribe)
- Add rate limiting to submission and report endpoints
- Seed more events from additional mosque flyers
- Link Supabase CLI (`supabase login` + `supabase link`)

### Open Questions
- Go Pray database access and format (still pending)
- halaqas.com domain registration
- Cloudflare account setup (for Pages + R2)

---

## Session 3 — Contact/Feedback, Upload UX, CLAUDE.md (2026-02-20)

### Completed
- **Contact Us / Feedback feature (full stack):** New `feedback` table (migration `004_feedback.sql`), `Feedback` type, public `POST /api/feedback` endpoint, `/contact` page with name/contact/message form, admin `GET/POST /api/admin/feedback` endpoint, `/admin/feedback` review page with "Mark as Read" button. Added Contact link to Header nav, Footer links, and Feedback card to admin dashboard. Follows the same pattern as mosque suggestions.
- **Flyer upload UX improvements:** Added drag & drop support to the "Upload Flyer" drop zone (highlights on drag, accepts dropped image files). Added a "Take a photo" button with `capture="environment"` for mobile users to snap a flyer directly using their phone camera. Refactored image processing into shared `processImageFile()` function used by all three input methods.
- **Created `CLAUDE.md`:** Project-root file automatically loaded into every Claude Code session. Contains stack overview, commands, project structure, key patterns (API routes, types, styling, "suggestion pattern" for new features), database tables, doc index, and end-session workflow. Replaces the manual start/end prompt copy-paste workflow from `docs/00-claude-code-prompts.md`.

### Decisions Made
- `CLAUDE.md` should be a stable, concise index — not a duplicate of the detailed docs. Only update when architecture or conventions change.
- End-session workflow is now documented in `CLAUDE.md` — triggered by saying "end session"
- Camera capture uses `capture="environment"` (rear camera) for photographing physical flyers at mosques

### Issues / Bugs
- R2 image storage still not configured (uploads fall back to data URLs)
- Supabase CLI not linked (`supabase login` needed) — migration was run manually via Supabase dashboard

### Next Session
- Set up Cloudflare Pages for auto-deploy from GitHub
- Set up Cloudflare R2 bucket and configure credentials
- Generate PWA icons
- QA pass: test all flows on mobile (especially contact form, drag & drop, camera capture)
- Replace placeholder mosque data with Go Pray database when available
- Begin seeding real Ramadan events for top Sydney mosques
- Add rate limiting to submission and report endpoints
- Link Supabase CLI (`supabase login` + `supabase link`)

### Open Questions
- Go Pray database access and format (still pending)
- halaqas.com domain registration
- Cloudflare account setup (for Pages + R2)

---

## Session 2 — UX Restructure & Calendar (2026-02-19)

### Completed
- **Home page now IS the event directory:** Moved full event listing with search bar, type/language/gender filters, and event grid from `/events` to the home page (`/`). Hero banner remains at top. `/events` now redirects to `/`.
- **"Add to Calendar" on event detail pages:** Each event has an "Add to Calendar" button that generates and downloads a `.ics` file. Recurring events include RRULE so the full series is added to the user's calendar (e.g. "Every Tuesday" creates a weekly recurring entry).
- **Mosques + Map merged:** Map view integrated into the mosques page (`/mosques`). Added suburb search bar with 5km radius filtering (Haversine). `/map` now redirects to `/mosques`.
- **Header nav simplified:** Removed "Events" and "Map" nav items. Now shows: Mosques, Submit Event, About.
- **Footer updated:** Replaced "Events" link with "Mosques".
- **Hero banner cleaned up:** Removed "Browse Events" button (was linking to itself). Changed "Submit an Event" to secondary colour variant.
- **About page:** Removed Go Pray comparison line.
- **EventFilters made path-aware:** Uses `usePathname()` so filters work correctly on `/` instead of only `/events`.
- **Event detail back link:** Now points to `/` instead of `/events`.

### Decisions Made
- Home page should be the primary event browsing experience — no separate events page needed
- Map belongs on the mosques page, not as a standalone page
- Single-event .ics download should include RRULE for recurring events (adds full series, not just one occurrence)
- Old routes (`/events`, `/map`) redirect rather than 404 to preserve any shared links

### Issues / Bugs
- R2 image storage still not configured (uploads fall back to data URLs)
- Dev server can be slow on first load / when `.next` cache is stale — clearing `.next` and restarting fixes it
- `next/dynamic` with `ssr: false` requires a client wrapper component (MapWrapper)

### Next Session
- Set up Cloudflare Pages for auto-deploy from GitHub
- Set up Cloudflare R2 bucket and configure credentials
- Generate PWA icons
- QA pass: test all flows on mobile (especially new merged mosques+map page)
- Replace placeholder mosque data with Go Pray database when available
- Begin seeding real Ramadan events for top Sydney mosques
- Add rate limiting to submission and report endpoints
- Commit and push all Session 2 changes

### Open Questions
- Go Pray database access and format (still pending)
- halaqas.com domain registration
- Cloudflare account setup (for Pages + R2)

---

## Session 1 — Full MVP Build (2026-02-19)

### Completed
- **Milestone 1.1 — Foundation:** Next.js 16 project with App Router, TypeScript, Tailwind CSS v4 with full Earthy Teal theme, Plus Jakarta Sans font, Supabase connected, database schema created with RLS and indexes, 20 Sydney mosques seeded
- **Milestone 1.2 — Event Directory & Mosque Pages:** Events page with filters (type, language, gender, suburb/5km radius), event detail page with prayer-anchored time display, mosques directory, mosque detail pages, recurring event badges, stale event styling
- **Milestone 1.3 — Event Submission Flow:** Three-tab submission (Upload Flyer, Paste Text, Manual Entry), Groq API integration for AI parsing (Llama 4 Scout vision + JSON mode), editable confirmation form, mosque dropdown, prayer-anchored time selector, recurrence pattern selector
- **Milestone 1.4 — Calendar, Map, Sharing:** Dynamic .ics feed per mosque with RRULE support, Leaflet + OpenStreetMap map view with mosque pins and event popups, "Near me" geolocation, WhatsApp share button with OG meta tags
- **Milestone 1.5 — Reporting & Admin:** Report issue button with reason selection and amendment submission, password-protected admin login, amendment review queue (approve/reject), admin event management (archive/activate/delete)
- **Milestone 1.6 — Launch Prep:** PWA manifest, SEO meta tags, About page, 12 demo events seeded across mosques
- GitHub repo initialised and pushed to https://github.com/sabs90/halaqas.git

### Tech Stack Confirmed
- Next.js 16.1.6 (App Router, Turbopack)
- Tailwind CSS v4 (CSS-based config with @theme inline)
- Supabase PostgreSQL with RLS
- Groq API (Llama 4 Scout) for AI parsing
- Adhan.js for prayer times (Shafi'i, Sydney coordinates)
- Leaflet + OpenStreetMap for map
- Manual .ics generation for calendar feeds

### File Structure
```
src/
  app/
    page.tsx                    — Home (hero + event directory with search/filters)
    events/page.tsx             — Redirects to /
    events/[id]/page.tsx        — Event detail + share + report + add to calendar
    events/[id]/AddToCalendarButton.tsx — .ics download with RRULE support
    events/[id]/ReportButton.tsx — Report issue flow
    mosques/page.tsx            — Mosque directory + map + suburb search (5km radius)
    mosques/MosqueSearch.tsx     — Suburb search client component
    mosques/[id]/page.tsx       — Mosque detail + calendar subscribe
    map/page.tsx                — Redirects to /mosques
    submit/page.tsx             — Event submission (3 input paths)
    about/page.tsx              — About page
    admin/page.tsx              — Admin login + dashboard
    admin/amendments/page.tsx   — Amendment review queue
    admin/events/page.tsx       — Event management
    api/events/route.ts         — GET list, POST create
    api/events/[id]/route.ts    — GET single event
    api/events/[id]/report/route.ts — POST report
    api/mosques/route.ts        — GET list
    api/mosques/[id]/calendar.ics/route.ts — GET .ics feed
    api/parse-image/route.ts    — POST AI parse image
    api/parse-text/route.ts     — POST AI parse text
    api/admin/auth/route.ts     — POST login, DELETE logout
    api/admin/amendments/route.ts — GET pending
    api/admin/amendments/[id]/route.ts — POST approve/reject
    api/admin/events/route.ts   — GET all, PATCH update, DELETE
  components/
    layout/ (Header, Footer)
    events/ (EventCard, EventFilters, EventTypeTag)
    map/ (EventMap, MapWrapper)
    ui/ (Button, FilterPill, Hero, IslamicPattern)
  lib/ (supabase, types, prayer-times, haversine, ics-generator, groq, r2, admin-auth)
  data/ (placeholder-mosques, sydney-suburbs)
```

### Database
- 20 mosques seeded (placeholder data — Go Pray import pending)
- 12 demo events seeded across various mosques and types
- Schema: mosques, events, amendments tables with enums and RLS

### Issues / Bugs
- None identified yet (needs QA testing)

### Not Yet Done
- Cloudflare Pages deployment setup (auto-deploy from GitHub)
- Cloudflare R2 bucket setup (image upload currently returns data URLs as fallback)
- Go Pray mosque database import (using placeholder data)
- PWA icons (manifest exists, icons not yet generated)
- Rate limiting on submission endpoints
- Content seeding with real Ramadan events
- Domain registration and DNS setup

### Next Session
- Set up Cloudflare Pages for auto-deploy from GitHub
- Set up Cloudflare R2 bucket and configure credentials
- Generate PWA icons
- QA pass: test all flows on mobile
- Replace placeholder mosque data with Go Pray database when available
- Begin seeding real Ramadan events for top Sydney mosques
- Add rate limiting to submission and report endpoints

### Open Questions
- Go Pray database access and format (still pending)
- halaqas.com domain registration
- Cloudflare account setup (for Pages + R2)

---

## Pre-Development — Planning Complete

### Completed
- Project concept defined and stress-tested
- All project documentation created:
  - Project brief / one-pager
  - Product requirements document (PRD)
  - Technical architecture and stack
  - MVP roadmap with phased milestones
  - Risk register (13 risks identified and mitigated)
  - Adoption and outreach plan
  - Style guide (Earthy Teal theme) with full Tailwind config
- Design direction finalised: Earthy Teal with Plus Jakarta Sans typography
- Key technical decisions locked in (Next.js, Supabase, Cloudflare Pages, Groq API)

### Decisions Made
- No user accounts — fully public, no login
- Community crowdsourced submissions with AI parsing (Groq/Llama 4 Scout)
- Three submission paths: image upload, text paste, manual form
- Prayer-anchored event times using Adhan.js (Shafi'i, Sydney coordinates)
- Dynamic .ics calendar feeds per mosque (not Google Calendar API)
- Admin review for amendments only — new submissions go live immediately
- Auto-archive recurring events after 3 months of inactivity
- Cloudflare Pages over Netlify for hosting
- Earthy Teal colour palette with terracotta secondary
