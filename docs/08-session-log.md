# Halaqas — Session Log

This file is the persistent memory between Claude Code sessions. Each entry summarises what was built, what changed, and what's next. Read from top (most recent) to bottom (oldest).

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
    page.tsx                    — Home (hero + upcoming events)
    events/page.tsx             — Event directory with filters
    events/[id]/page.tsx        — Event detail + share + report
    mosques/page.tsx            — Mosque directory
    mosques/[id]/page.tsx       — Mosque detail + calendar subscribe
    map/page.tsx                — Map view
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
