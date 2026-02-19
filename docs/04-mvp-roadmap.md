# Halaqas — MVP Roadmap

## Timeline Overview

Target launch: **Start of Ramadan 2026** (approximately late February / early March 2026)

The roadmap is split into three phases. Only Phase 1 needs to be complete before launch. Phases 2 and 3 happen after launch based on community response and capacity.

---

## Phase 1: MVP Build & Launch (Pre-Ramadan)

**Goal:** A functional public website with seeded content, ready for Ramadan.

### Milestone 1.1 — Foundation (Week 1–2)

- [x] Set up GitHub repo, Next.js project, Tailwind CSS
- [ ] Connect Cloudflare Pages for auto-deploy
- [x] Set up Supabase project with database schema (mosques, events, amendments tables)
- [ ] Set up Cloudflare R2 bucket for image storage
- [ ] Import Go Pray mosque database (names, addresses, coordinates) into Supabase
- [x] Basic project structure: pages, API routes, layout components

**Deliverable:** Empty but deployed website at halaqas.com with mosque data loaded.

### Milestone 1.2 — Event Directory & Mosque Pages (Week 2–3)

- [x] Event listing page with filters (mosque, suburb/radius, date, event type, language, gender) — *moved to home page in Session 2*
- [x] Suburb selector with 5km radius filtering (Haversine query) — *implemented as search bar with 5km radius matching*
- [x] Individual mosque pages showing all events for that mosque
- [x] Individual event detail pages with all fields displayed
- [x] Prayer time calculation integrated (Adhan.js, Shafi'i method, Sydney coordinates)
- [x] Prayer-anchored event display: "After Isha (~8:12 PM this week)"
- [x] Recurring event display with visual indicator
- [x] Mobile-responsive design throughout
- [x] Map integrated into mosques page with suburb search (5km radius) — *added in Session 2*

**Deliverable:** Browsable event directory (empty of events, but functional).

### Milestone 1.3 — Event Submission Flow (Week 3–4)

- [x] Submission page with three input paths: image upload, text paste, manual form
- [x] Groq API integration for AI parsing of flyer images (Llama 4 Scout, vision + JSON mode)
- [x] Groq API integration for AI parsing of pasted text
- [x] Editable confirmation screen: AI-extracted fields pre-filled, missing fields highlighted
- [x] Mosque dropdown selector from database, plus "Other Venue" option with manual address
- [x] Prayer-anchored time selection (prayer + offset)
- [x] Recurring event options (pattern selector)
- [ ] Image upload to Cloudflare R2 *(fallback to data URLs until R2 configured)*
- [x] Event published to database on confirmation

**Deliverable:** End-to-end submission flow working — upload flyer, confirm details, event goes live.

### Milestone 1.4 — Calendar, Map, Sharing (Week 4–5)

- [x] Dynamic .ics feed generation per mosque (`/api/mosques/[id]/calendar.ics`)
- [x] "Subscribe to calendar" button on each mosque page
- [x] Map view with Leaflet + OpenStreetMap showing mosques with events — *merged into mosques page in Session 2*
- [x] Click mosque pin → see upcoming events
- [x] Geolocation "near me" option
- [x] WhatsApp share button on each event with Open Graph meta tags for rich preview
- [x] Source flyer image displayed on event detail page
- [x] "Add to Calendar" button on individual event detail pages with RRULE for recurring events — *added in Session 2*

**Deliverable:** Full discovery experience — list, map, calendar, sharing.

### Milestone 1.5 — Reporting & Admin (Week 5–6)

- [x] "Report issue" button on each event
- [x] Reason selection flow (ended, wrong date/time, wrong details, duplicate, other)
- [x] Amendment submission with editable fields for "wrong details"
- [x] Password-protected admin page
- [x] Admin review queue: old details vs new details, approve/reject
- [x] Admin ability to edit, delete, archive events
- [x] Admin ability to de-list a mosque
- [ ] Auto-archive logic: recurring events flagged after 3 months of no confirmation

**Deliverable:** Complete quality management loop — community reports, admin reviews.

### Milestone 1.6 — Content Seeding & Launch Prep (Week 6–7)

- [ ] Manually seed events for top 20 Sydney mosques (using the submission flow)
- [ ] Focus on Ramadan-specific programs: taraweeh schedules, iftar events, lecture series
- [ ] QA pass: test all flows on mobile (iPhone + Android), check edge cases
- [x] PWA setup: add-to-home-screen manifest *(icons not yet generated)*
- [x] SEO basics: meta tags, sitemap, structured data (Event schema)
- [x] Simple "About" page explaining what Halaqas is and how to contribute
- [ ] Rate limiting on submission endpoints

**Deliverable:** Halaqas is live with 20+ mosques and real events. Ready for community use.

---

## Phase 2: Community Adoption (Ramadan & Post-Ramadan)

**Goal:** Grow community submissions and usage beyond the initial seed.

### Milestone 2.1 — Ramadan Launch Push

- [ ] Share launch via personal networks, WhatsApp groups, mosque contacts
- [ ] Leverage Go Pray's community and reputation (if endorsement secured)
- [ ] Engage mosque social media pages to share Halaqas
- [ ] Monitor submissions, fix bugs, respond to feedback quickly
- [ ] Switch prayer time recalculation to daily during Ramadan

### Milestone 2.2 — Post-Ramadan Sustainability

- [ ] Assess: are community submissions continuing without prompting?
- [ ] Identify top contributors and invite them as volunteer admins if needed
- [ ] Add volunteer admin access to the admin panel (multi-user, still simple)
- [ ] Run auto-archive sweep on Ramadan-specific events
- [ ] Refresh suburb/mosque coverage based on usage data

### Milestone 2.3 — Feedback-Driven Improvements

- [ ] Collect and prioritise community feedback
- [ ] Address top usability issues
- [ ] Optimise AI parsing prompt based on real submission data (common flyer formats, edge cases)
- [ ] Add Gemini Flash as fallback for submissions where Llama 4 Scout parsing confidence is low

---

## Phase 3: Enhancements (If Warranted)

**Goal:** Only pursue these if the platform has proven organic adoption. Do not build speculatively.

### Potential Enhancements

- **Notification system:** Email or push alerts for new events at subscribed mosques
- **Multi-language interface:** Arabic UI at minimum, potentially Urdu, Turkish, Bahasa
- **Mosque self-service:** Allow mosque admins to claim their page and manage events directly (requires lightweight auth)
- **Event series / courses:** Better handling of multi-session classes (Week 1 of 8, etc.)
- **Community features:** Bookmarking events, personal event calendar view
- **Analytics dashboard:** Public stats (most active mosques, popular event types, peak times)
- **Expansion:** Other Australian cities (Melbourne, Brisbane) if there's demand
- **Native app:** Only if there's clear evidence the PWA isn't sufficient

---

## Effort Estimates

| Milestone | Estimated Effort | Status | Dependencies |
|-----------|-----------------|--------|--------------|
| 1.1 Foundation | 3–5 days | **Mostly done** (R2 + Cloudflare Pages pending) | Go Pray database access |
| 1.2 Event Directory | 5–7 days | **Done** | 1.1 complete |
| 1.3 Submission Flow | 5–7 days | **Done** (R2 upload pending) | 1.1 complete, Groq API key |
| 1.4 Calendar/Map/Sharing | 3–5 days | **Done** | 1.2 complete |
| 1.5 Reporting & Admin | 3–5 days | **Done** (auto-archive pending) | 1.2, 1.3 complete |
| 1.6 Seeding & Launch | 3–5 days | **Partially done** (seeding + QA + rate limiting pending) | All above complete |
| **Total Phase 1** | **~5–7 weeks** | **~85% complete** (built in 2 sessions) | |

Milestones 1.1–1.5 were built in a single session using Claude Code. Remaining work is infrastructure setup (Cloudflare Pages, R2), data (Go Pray import, real event seeding), and polish (QA, rate limiting, PWA icons).

---

## Key Dependencies

| Dependency | Status | Risk |
|-----------|--------|------|
| Go Pray mosque database access | To be confirmed with friend | Low — strong relationship |
| Groq API account + key | **Done** — key configured in .env.local | Resolved |
| halaqas.com domain | Not yet registered | Low — register early |
| Cloudflare account | Not yet set up | Low — free tier |
| Supabase account | **Done** — project created, schema deployed, 20 mosques + 12 events seeded | Resolved |
| Flyers from top 20 mosques | Need to collect | Medium — requires manual effort in the weeks before Ramadan |
