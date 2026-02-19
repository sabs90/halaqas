# Halaqas — Session Log

This file is the persistent memory between Claude Code sessions. Each entry summarises what was built, what changed, and what's next. Read from top (most recent) to bottom (oldest).

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
