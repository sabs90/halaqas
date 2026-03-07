# Halaqas — Session Log

This file is the persistent memory between Claude Code sessions. Each entry summarises what was built, what changed, and what's next. Read from top (most recent) to bottom (oldest).

---

## Session 20 — Performance Fixes, Event Correction, UI Cleanup (2026-03-07)

### Completed
- **Mosques page performance overhaul:**
  - Removed events query entirely — mosques page was fetching all events with mosque joins just for map popup text. Map popups now link to mosque page instead.
  - Default to NSW on initial load (29 mosques instead of 66) — users click "All" to see nationwide.
  - State filter pushed to DB query level (was fetching all then filtering in JS).
- **Admin page speed fix:** Auth check was calling `/api/admin/events` (full event list query) just to verify login. Added lightweight `GET /api/admin/auth` that only checks the session cookie — no DB query.
- **Mosque search 5km radius:** Suburb searches on mosques page now return mosques within 5km radius (matching home page behaviour), not just text matches.
- **Suggest a Mosque button:** Changed from plain text link to solid teal button for stronger contrast.
- **Removed language filter:** Removed Language pills from EventFilters to reduce clutter — data and API filtering still available.
- **Parramatta Mosque tahajjud fix:** Deleted incorrect event (wrong time: "15min after Isha" instead of 3:00 AM, wrong date: 18 Feb instead of 19 Feb). Created two correct replacement events:
  - Daily Tahajjud Prayer (Mon–Fri) at 3:00 AM
  - Daily Tahajjud Prayer (Sat & Sun) at 2:30 AM
  - Both with recurrence_end_date 2026-03-19
- **Committed and pushed** sessions 12–19 (73 files, had been uncommitted).

### Decisions Made
- Mosques page defaults to NSW (not "All") since most users are in Sydney and loading 66 mosques + map is slow
- Events query removed from mosques page entirely — not worth a full table scan for map popup labels
- Language filter hidden from UI but preserved in data model and API — can be re-added later if needed
- Tahajjud split into weekday/weekend events using `daily_ramadan` pattern with descriptions clarifying which days apply (data model lacks weekday/weekend recurrence patterns)

### Issues / Bugs
- None

### Next Session
- Run migration 011 on Supabase production (carried over)
- Seed some test events with kids/family tags (carried over)
- Consider adding kids/family to the admin batch review form's editable fields (carried over)
- Commit and push this session's changes

### Open Questions
- None

---

## Session 19 — Performance Optimisation (2026-03-07)

### Completed
- **ISR caching on key pages:** Replaced `force-dynamic` with `revalidate = 300` (5 min) on `events/[id]`, `mosques`, and `mosques/[id]` pages. Pages now serve from cache and revalidate in background.
- **React `cache()` deduplication:** Wrapped `getEvent()` and `getMosque()` with React's `cache()` so `generateMetadata()` and the page component share a single DB query per request (was 2 queries each).
- **Parallel data fetching:** `mosques/[id]` now fetches mosque and events concurrently with `Promise.all()` instead of sequentially.
- **Loading skeletons:** Created `loading.tsx` files for home page, event detail, mosques list, and mosque detail — Next.js streams the shell immediately while data loads.
- **API Cache-Control headers:** Events GET returns `public, max-age=60, stale-while-revalidate=300`. Calendar ICS endpoint changed from `no-cache, no-store` to `public, max-age=3600` and removed `Content-Disposition: attachment` (was blocking calendar subscription apps).
- **Flyer image optimisation:** Replaced raw `<img>` with `next/image` on event detail page for automatic lazy loading, responsive sizing, and format conversion. Added `remotePatterns` to `next.config.ts`.
- **EventCard memoisation:** Wrapped with `React.memo()` to prevent unnecessary re-renders during filter changes.
- **Netlify static asset caching:** Added `[[headers]]` rules in `netlify.toml` for `/_next/static/*`, `*.js`, `*.css`, and `/fonts/*` with 1-year immutable cache.

### Decisions Made
- `revalidate = 300` (5 min) for detail pages vs `revalidate = 60` (1 min) on home page — detail pages change less frequently
- Removed `Content-Disposition: attachment` from calendar ICS endpoint — it was preventing calendar apps from subscribing (treating it as a download instead of a feed)
- Used wildcard `hostname: '**'` for `next/image` remote patterns since flyer images may come from various sources (R2, data URLs, etc.)

### Issues / Bugs
- None discovered

### Next Session
- Run migration 011 on Supabase production (carried over)
- Seed some test events with kids/family tags (carried over)
- Consider adding kids/family to the admin batch review form's editable fields (carried over)

### Open Questions
- None

---

## Session 18 — Home Page Performance (2026-03-07)

### Completed
- **Optimised home page query:** Replaced `select('*, mosque:mosques(*)')` with explicit column list (22 event + 6 mosque columns), dropping `flyer_image_url`, `submitter_contact`, `created_at`, `venue_address`, and unused mosque columns from the payload.
- **Added query limit:** `.limit(50)` on both home page and `/api/events` GET route as a safety cap.
- **ISR caching:** Replaced `force-dynamic` with `revalidate = 60` on home page — serves cached page instantly, regenerates in background every 60 seconds.
- **API route parity:** Applied same column select and default limit (50) to `/api/events` GET handler.

### Decisions Made
- Limit of 50 events (not 100) — sufficient for the home page grid during Ramadan
- `revalidate = 60` balances freshness vs performance — new events appear within 1 minute
- Used `as unknown as Event[]` cast since Supabase TS inference doesn't handle explicit column selects on relations cleanly

### Issues / Bugs
- None discovered

### Next Session
- Run migration 011 on Supabase production (carried over)
- Seed some test events with kids/family tags (carried over)
- Consider adding kids/family to the admin batch review form's editable fields (carried over)

### Open Questions
- None

---

## Session 17 — Kids & Family Tags (2026-03-06)

### Completed
- **Kids & Family tags for events:** Added `is_kids` and `is_family` boolean columns to the events table (migration 011), allowing events to be tagged as child-friendly and/or family-oriented.
- **AI parsing:** Updated Groq system prompt to extract kids/family indicators from flyers.
- **Submit form:** Added "Kids event" and "Family event" checkboxes to the event submission form, auto-populated from AI parsing.
- **Event display:** New `AudienceTag` component (blue for kids, sage for family) shown on EventCard, event detail page, and admin events page.
- **Filtering:** Added "Kids" and "Family" toggle pills in a new "Audience" section of EventFilters. Server-side filtering on home page and API route.
- **Batch processing:** Updated batch flyer tool to pass through is_kids/is_family from AI parsing to API.

### Decisions Made
- Kids and family are independent booleans (an event can be both, either, or neither) rather than an enum
- Filter params use `kids=true` / `family=true` URL params (toggle on/off, not mutual exclusive)
- AudienceTag uses same visual style as EventTypeTag but with distinct colours

### Issues / Bugs
- None discovered

### Next Session
- Run migration 011 on Supabase production
- Seed some test events with kids/family tags
- Consider adding kids/family to the admin batch review form's editable fields

### Open Questions
- None

---

## Session 16 — Event Review/Approval Workflow (2026-03-04)

### Completed
- **Event moderation workflow:** Public event submissions now land in `pending_review` status instead of going live immediately. Admin must approve before events appear on the site.
- **Migration 010:** Added `pending_review` to the `event_status` enum
- **Admin review API:** `GET /api/admin/review` lists pending events; `POST` approves (sets active + confirmed) or rejects (hard-deletes)
- **Admin review page:** `/admin/review` shows full event details (type, language, gender, time, speaker, recurrence, description, flyer, submitter contact) with approve/reject buttons
- **Admin dashboard:** Added "Review Submissions" card as the first item with amber border for visibility
- **Admin events page:** Added amber badge styling for `pending_review` status
- **Submit page:** Updated success message to "Submitted for Review!" explaining the event will appear once approved
- **Duplicate detection:** Now checks both `active` and `pending_review` events to prevent duplicates across pending submissions
- **Admin batch processing:** Unchanged — still inserts as `active` since admin is already reviewing during batch flow

### Decisions Made
- Public submissions → `pending_review` (hidden from public via existing RLS policy `status = 'active'`)
- Admin batch processing stays as `active` — admin is already reviewing during the batch flow
- Reject action hard-deletes rather than soft-archiving — rejected submissions have no value to keep
- No notification system for submitters when their event is approved/rejected (keep it simple for now)

### Issues / Bugs
- None

### Next Session
- Run migration 010 (event review status) on Supabase
- Run migration 009 (duplicate cleanup) on Supabase
- Run migration 007 (analytics) on Supabase
- Set up `halaqas.com` domain and point to Netlify
- Set up Cloudflare R2 bucket for image storage
- QA pass on mobile
- Continue seeding events for remaining mosques

### Open Questions
- None

---

## Session 15 — Duplicate Prevention & Batch UX (2026-03-04)

### Completed
- **Event detail page:** Moved action buttons (Add to Calendar, WhatsApp Share, Report) above the flyer image for better visibility
- **Duplicate event cleanup:** Migration 009 — SQL to delete existing duplicate events, keeping the most recently created row per group (partitioned by title + mosque + date + recurrence pattern)
- **Batch admin dedup prevention:** Removed `force: true` from batch flyer submission so the existing dedup check in `POST /api/events` now runs. 409 (duplicate) responses are treated as "skipped" with amber UI, not errors
- **Batch review layout:** Side-by-side flyer + events layout in the review step — flyer shown full-size on the left (sticky) with extracted events on the right. Container breaks out of 900px max-width to 1024px for better review experience

### Decisions Made
- No database-level unique constraint on events — app-level dedup (title + mosque + date match) is sufficient and more flexible for edge cases
- Duplicates in batch flow treated as non-errors (amber "Skipped — Already Exist" section) rather than failures, since they're expected when re-processing flyers

### Issues / Bugs
- None

### Next Session
- Run migration 009 (duplicate cleanup) on Supabase
- Run migration 007 (analytics) on Supabase
- Add `NEXT_PUBLIC_UMAMI_WEBSITE_ID` to Netlify env vars
- Set up `halaqas.com` domain and point to Netlify
- Set up Cloudflare R2 bucket for image storage
- QA pass on mobile
- Continue seeding events for remaining mosques

### Open Questions
- halaqas.com domain registration and DNS setup (carried over)

---

## Session 14 — Duplicate Event UX Improvement (2026-03-04)

### Completed
- **"OK — no need to submit" button:** Added a third option to the duplicate event warning screen on `/submit`. When a user sees the "Similar Event Found" dialog, they can now acknowledge the duplicate without submitting or going back to edit. Shows a friendly confirmation: "Looks like this event is already listed. Thanks for checking!"

### Decisions Made
- Reused the existing `success` step with a new `duplicate_ok` success type rather than creating a separate step
- Button order: "This is different — submit anyway" (terracotta) → "OK — no need to submit" (primary teal) → "Cancel — go back to editing" (outline)

### Issues / Bugs
- None

### Next Session
- Run migration 007 (analytics) on Supabase
- Add `NEXT_PUBLIC_UMAMI_WEBSITE_ID` to Netlify env vars
- Set up `halaqas.com` domain and point to Netlify
- Set up Cloudflare R2 bucket for image storage
- QA pass on mobile
- Continue seeding events for remaining mosques

### Open Questions
- halaqas.com domain registration and DNS setup (carried over)

---

## Session 13 — Mosque Data Review & Cleanup (2026-03-04)

### Completed
- **Mosque review checklist workflow:** Generated `docs/mosque-review.md` with all 80 mosques from live DB, grouped by state with editable Name/Nicknames/Address fields and deletion checkboxes
- **User reviewed all 80 mosques:** Marked 14 for deletion, corrected ~60 names/addresses/nicknames
- **Database cleanup via Supabase REST API:** 14 mosques deleted, 60 updated (names, addresses, nicknames, coordinates), 1 new event created (Al Siraat College Epping taraweeh)
- **Geocoding:** Re-geocoded all updated addresses via Nominatim (15 required retry with cleaned-up address formatting)
- **Migration 008:** `supabase/migrations/008_mosque_review_cleanup.sql` — SQL record of all changes (applied via REST API, not raw SQL)
- **Coverage doc refreshed:** `docs/09-mosque-coverage.md` regenerated from live DB — 66 mosques across 8 states, 7 with events

### Decisions Made
- Used Supabase REST API (PostgREST PATCH/DELETE) instead of raw SQL execution — REST API doesn't support arbitrary SQL
- Kept migration SQL file as documentation record even though changes were applied via REST
- Renumbered migration from 007 to 008 to avoid conflict with analytics migration

### Issues / Bugs
- 15/53 addresses failed Nominatim geocoding on first pass (unit numbers, duplicate suburbs, extra commas). All resolved on retry with cleaned-up formatting.
- Two typos caught in user's review: "Masjid Al- (Belmore)" and "Hills District Muslim Societ" — confirmed corrections with user before applying.

### Next Session
- Run migration 007 (analytics) on Supabase
- Add `NEXT_PUBLIC_UMAMI_WEBSITE_ID` to Netlify env vars
- Set up `halaqas.com` domain and point to Netlify
- Set up Cloudflare R2 bucket for image storage
- QA pass on mobile
- Continue seeding events for remaining mosques

### Open Questions
- halaqas.com domain registration and DNS setup (carried over)

---

## Session 12 — Usage Tracking & Analytics (2026-03-04)

### Completed
- **Hybrid analytics system:** Umami Cloud for general traffic (visitors, geo, devices, referrers) + Supabase DIY for domain-specific metrics queryable from admin panel.
- **Database:** New `analytics_events` table (migration 007) with indexes on event_name, mosque_id, created_at, and composite. RLS allows public insert only.
- **Tracking helpers:** `src/lib/tracking.ts` (client-side, fires to both `/api/analytics` and `window.umami`) and `src/lib/tracking-server.ts` (server-side, direct Supabase insert). Both fire-and-forget, never block UI or page renders.
- **Public analytics API:** `POST /api/analytics` with allowlisted event names, silently accepts tracking data.
- **12 instrumentation points:**
  - Server-side: mosque_view, event_view, calendar_feed_fetch, event_submission, mosque_suggestion, feedback_submission
  - Client-side: calendar_download_event, calendar_google_event, calendar_outlook_event, calendar_download_mosque, calendar_subscribe_mosque, whatsapp_share
- **WhatsAppShareButton:** New client component extracted from inline server-rendered button to enable onClick tracking.
- **SubscribeCalendarButton:** Added `mosqueId` prop for tracking context.
- **Umami Cloud integration:** Script tag in layout.tsx, conditional on `NEXT_PUBLIC_UMAMI_WEBSITE_ID`. Configured with website ID.
- **Admin analytics dashboard** (`/admin/analytics`): Period selector (7d/30d/90d), page view count, most popular mosques table (views + cal downloads), recent activity feed.
- **Admin dashboard:** Added Analytics card to the grid.

### Decisions Made
- Hybrid approach: server-side tracking for page views (immune to ad blockers), client-side for button clicks.
- No PII stored — no IPs, user agents, or cookies in the analytics table.
- Event name allowlist in public API to prevent arbitrary data injection.
- JS-side aggregation in admin API (no GROUP BY RPC) — fine for this scale.

### Issues / Bugs
- Migration 007 needs to be run manually in Supabase SQL editor.
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` needs to be added to Netlify environment variables.

### Next Session
- Run migration 007 on Supabase
- Add `NEXT_PUBLIC_UMAMI_WEBSITE_ID` to Netlify env vars
- Set up `halaqas.com` domain and point to Netlify
- Set up Cloudflare R2 bucket for image storage
- QA pass on mobile
- Continue seeding events

### Open Questions
- halaqas.com domain registration and DNS setup (carried over)

---

## Session 11 — Batch Upload NetworkError Fix (2026-03-04)

### Completed
- **Diagnosed batch flyer upload "NetworkError when attempting to fetch resource"** — root cause: Netlify serverless function timeout (10s free tier) exceeded by Groq vision API calls
- **Added `maxDuration = 60` export** to `/api/admin/parse-flyers` and `/api/parse-image` route handlers — tells Netlify runtime to allow longer execution (capped at plan limit: 10s free, 26s Pro)
- **Reduced image compression** in batch page from 1200px/75% to 800px/60% — smaller base64 payload speeds up Groq API response time
- **Created `netlify.toml`** with `timeout = 26` for all serverless functions

### Decisions Made
- Smaller compressed images (800px/60%) are sufficient quality for Groq vision parsing and significantly reduce API latency
- `maxDuration` route segment config is the Next.js-native way to configure function timeouts on Netlify

### Issues / Bugs
- On Netlify free tier, function timeout is hard-capped at 10 seconds regardless of `maxDuration` setting. If Groq API still exceeds 10s, upgrading to Netlify Pro (26s) or moving API routes to a different host may be needed.

### Next Session
- Deploy and test batch upload on Netlify to verify the fix
- Set up `halaqas.com` domain and point to Netlify
- Set up Cloudflare R2 bucket for image storage
- Continue seeding events using batch tool
- Add rate limiting to submission endpoints

### Open Questions
- Is the Netlify free tier 10s timeout sufficient after image compression reduction, or will Pro be needed?

---

## Session 10 — Batch Flyer Processing Tool (2026-03-03)

### Completed
- **Batch flyer processing page** (`/admin/batch`): New admin tool for bulk event data entry. Three-step flow: Upload → Review → Submit.
  - **Upload step:** Multi-file drag-and-drop zone with sequential flyer processing (avoids Groq rate limits). Shows thumbnails with live status per flyer (queued/parsing/done/error) and event count.
  - **Review step:** Events grouped by source flyer with collapsible sections. Each event is an editable card with: checkbox to include/exclude, confidence badge (green/amber/red), editable title, mosque dropdown, event type, language, gender, speaker, time mode toggle (fixed/prayer), recurrence, description. Compact 2-column layout. Select All / Deselect All controls.
  - **Submit step:** Iterates through selected events, POSTs to `/api/events` with `force: true` (skip duplicate detection). Real-time progress bar. Summary of created/failed events. Retry Failed button. Start New Batch to reset.
- **Admin parse-flyers API** (`/api/admin/parse-flyers`): Admin-gated endpoint accepting single image via FormData. Calls `parseImageWithGroqMulti()` for multi-event extraction + `uploadToR2()` in parallel. Returns `{ events, flyer_image_url }`.
- **Admin dashboard updated:** Added "Batch Process Flyers" card to admin dashboard grid.

### Decisions Made
- Client-side orchestration — each flyer sent individually to the API endpoint (avoids Netlify serverless timeout limits). Progress tracked in the browser.
- Sequential flyer processing to avoid Groq rate limits (not parallel).
- Reused existing `POST /api/events` with `force: true` for submission — no new event creation logic needed.
- Duplicated `compressImage()` and mosque matching logic from `/submit` into batch page (decoupled from public form).
- No changes to `groq.ts`, `types.ts`, `r2.ts`, or `events/route.ts`.

### Issues / Bugs
- None from this session.

### Next Session
- Set up `halaqas.com` domain and point to Netlify
- Set up Cloudflare R2 bucket for image storage (will replace data URL fallback)
- QA pass: test batch tool with real flyers on mobile
- Add rate limiting to submission endpoints
- Continue seeding events using the coverage tracker and batch tool

### Open Questions
- halaqas.com domain registration and DNS setup (carried over — main blocker)

---

## Session 9 — Flyer Image Save & Display (2026-03-02)

### Completed
- **Flyer image pipeline wired up end-to-end:** Uploaded flyers are now saved and displayed on event detail pages. Previously the image was parsed by AI then discarded — `flyer_image_url` was always null.
- **Client-side image compression:** Added `compressImage()` in the submit page — resizes to max 1200px wide (preserving aspect ratio) and re-encodes as JPEG at 0.75 quality before uploading. Keeps data URL fallback manageable (~100-200KB vs 2-5MB raw).
- **Parse-image API uploads flyer:** `/api/parse-image` now calls `uploadToR2()` in parallel with Groq parsing and returns `flyer_image_url` in the response. Uses data URL fallback until R2 credentials are configured.
- **Form state capture:** `applyParsedData()` now captures `flyer_image_url` from the parse response into form state. The existing `handleSubmit()` already spreads the full form into the POST body, so it flows through automatically.
- **Type updated:** Added `flyer_image_url` to `ParsedEventData` interface.

### Decisions Made
- Image compression done client-side (Canvas API) rather than server-side — reduces upload size before it hits the API, and keeps data URL fallback size reasonable.
- Compression settings: max 1200px width, JPEG 0.75 quality — good balance of visual quality vs file size for flyers.
- Upload runs in parallel with Groq parsing (`Promise.all`) — no additional latency.

### Issues / Bugs
- R2 credentials still not configured — images stored as base64 data URLs in the database. This works but is inefficient for storage. Will be resolved when R2 bucket is set up.

### Next Session
- Set up `halaqas.com` domain and point to Netlify
- Set up Cloudflare R2 bucket for image storage (will replace data URL fallback)
- QA pass: test flyer upload → event display flow on mobile
- Add rate limiting to submission endpoints
- Continue seeding events using the coverage tracker as a guide

### Open Questions
- halaqas.com domain registration and DNS setup (carried over — main blocker)

---

## Session 8 — Planning & Coverage Tracker (2026-03-02)

### Completed
- **Mosque coverage tracker:** Created `docs/09-mosque-coverage.md` — a checklist of all 80 mosques organised by state and approximate prominence, with event counts. Serves as a manual to-do list for seeding events during Ramadan.
- **Reviewed project status:** Assessed overall progress (~90% of Phase 1 complete), identified remaining blockers (domain, R2, rate limiting).

### Decisions Made
- **Google Calendar sync approach parked:** Considered maintaining a Google Calendar per mosque and syncing nightly, but decided to hold off until `halaqas.com` domain is registered — the existing `webcal://` subscription should work once DNS resolves. Google Calendar sync would add significant complexity (80 calendars, API credentials, prayer-anchored time recalculation, up to 24hr delay).
- Coverage tracker kept as a simple markdown file rather than a database feature — easy to update manually between sessions.

### Issues / Bugs
- None from this session.

### Next Session
- Set up `halaqas.com` domain and point to Netlify
- Update `NEXT_PUBLIC_SITE_URL` to final domain and redeploy
- Set up Cloudflare R2 bucket for image storage
- QA pass: test all flows on mobile with production URL
- Add rate limiting to submission endpoints
- Continue seeding events using the coverage tracker as a guide

### Open Questions
- halaqas.com domain registration and DNS setup (carried over — this is the main blocker)

---

## Session 7 — Admin Mosque Management & Build Fix (2026-03-02)

### Completed
- **Admin mosque management page:** New page at `/admin/mosques/manage` to view and edit all mosques in the database. Features inline editing of name, address, suburb, state, coordinates, nicknames, and active status.
- **Extended admin mosques API:** GET now supports `?list=all` to return all mosques (ordered by name). Added PATCH handler to update mosque fields with whitelist validation.
- **Admin dashboard card:** Added "Manage Mosques" card to admin dashboard, placed before "Mosque Suggestions".
- **Client-side search and filter:** Search across name, suburb, address, nicknames; state dropdown filter.
- **Auto-geocoding on address edit:** Changing a mosque's address and blurring the field auto-geocodes via `/api/geocode` and populates lat/lng fields. Shows status feedback (found/not found).
- **Clickable mosque cards:** Entire mosque card is clickable to open edit form, not just a small Edit button.
- **Fixed /submit build error:** Wrapped `useSearchParams()` in a `<Suspense>` boundary — `npm run build` now passes cleanly.

### Decisions Made
- Kept existing `/admin/mosques` suggestions page unchanged — the new manage page is a separate route at `/admin/mosques/manage`.
- PATCH handler whitelists 8 fields (`name`, `address`, `suburb`, `state`, `latitude`, `longitude`, `nicknames`, `active`) to prevent arbitrary updates.
- No new migration needed — all columns already exist in the mosques table.
- Reused existing `/api/geocode` endpoint for admin mosque address geocoding.

### Issues / Bugs
- None outstanding from this session.

### Next Session
- Set up `halaqas.com` domain and point to Netlify
- Set up Cloudflare R2 bucket for image storage
- QA pass: test all flows on mobile with production URL
- Add rate limiting to submission endpoints
- Seed more events (especially for non-NSW mosques)

### Open Questions
- halaqas.com domain registration and DNS setup (carried over)

---

## Session 6 — ICS Calendar Fixes & Calendar UX (2026-02-24)

### Completed
- **Android ICS fix:** Added `DTSTAMP` to every VEVENT in both server-side (`ics-generator.ts`) and client-side (`AddToCalendarButton.tsx`) ICS generation. Android strictly requires this per RFC 5545; without it, calendar says "no events could be added".
- **RFC 5545 line folding:** Added `foldLine()` function to `ics-generator.ts` that folds lines longer than 75 octets per spec, with proper UTF-8 boundary handling. Applied to SUMMARY, LOCATION, DESCRIPTION, X-WR-CALNAME.
- **Trailing CRLF:** ICS output now ends with `\r\n` as required by spec.
- **Single-event "Add to Calendar" dropdown:** Rewrote `AddToCalendarButton.tsx` from a simple download button to a dropdown with three options: Download .ics, Google Calendar (`action=TEMPLATE`), and Outlook (web compose URL). Extracted shared `getEventDates()` function for date computation across all three formats.
- **Mosque "Add All to Calendar" dropdown:** Rewrote `SubscribeCalendarButton.tsx` as a dropdown with two options: Download .ics (one-time import) and Subscribe to calendar (live-updating via `webcal://` protocol). Each option has a subtitle explaining the behaviour.
- **"Add an Event" button on mosque page:** Added button linking to `/submit?mosque={id}` on mosque detail pages.
- **Submit page mosque pre-fill:** Added `useSearchParams` to submit page so `?mosque=UUID` query param pre-fills the mosque selector after mosques load.
- **Deployed to Netlify:** Site now live at `halaqas.netlify.app`. Committed and pushed all changes.

### Decisions Made
- Google Calendar `action=TEMPLATE` works reliably for single events (opens pre-filled form in browser). Google Calendar `cid=` subscription is unreliable for third-party ICS feeds — removed from mosque dropdown.
- Outlook `addfromweb` subscription similarly unreliable — removed from mosque dropdown.
- Mosque calendar dropdown simplified to two options: .ics download (works everywhere now) and webcal:// subscription (will work when domain is set up).
- `Content-Disposition: attachment` kept on mosque ICS endpoint for download behaviour.
- Hosting moved to Netlify (not Cloudflare Pages as originally planned).

### Issues / Bugs
- `webcal://` subscription fails because `NEXT_PUBLIC_SITE_URL` points to `halaqas.com` which doesn't resolve yet. Will work once domain is configured to point to Netlify.
- `NEXT_PUBLIC_SITE_URL` is baked in at Next.js build time — must redeploy after changing it in Netlify env vars.
- Apple Calendar aggressively caches subscribed calendars (known from Session 4).

### Next Session
- Set up `halaqas.com` domain and point to Netlify — this unblocks webcal:// subscription
- Update `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy
- Set up Cloudflare R2 bucket for image storage
- Generate PWA icons
- QA pass: test all calendar flows on mobile (Android + iOS) with production URL
- Add rate limiting to submission and report endpoints
- Seed more events (especially for non-NSW mosques)

### Open Questions
- halaqas.com domain registration and DNS setup (immediate priority)
- Cloudflare R2 setup (for image storage — separate from hosting)

---

## Session 5 — Australian Mosque Expansion (2026-02-23)

### Completed
- **Nationwide mosque expansion:** Added 58 new mosques across all 8 Australian states/territories, bringing the total from 22 (all NSW) to 80. Migration 006 adds `state` column, unique constraint on mosque name, and state index.
  - NSW: 22 existing + 17 new = 39
  - VIC: 15, QLD: 8, WA: 8, SA: 5, ACT: 3, NT: 1, TAS: 1
- **Geocoding helper script:** Created `scripts/generate-mosque-migration.mjs` — takes a hardcoded mosque list, hits Nominatim (OpenStreetMap) at 1 req/sec rate limit, outputs a SQL migration file. 49/58 auto-geocoded; 9 filled with manual approximate coordinates.
- **State filtering on mosques page:** Added pill-style state filter tabs (All, NSW, VIC, QLD, WA, SA, ACT, NT, TAS) above the search bar. URL params `?state=VIC&q=Preston` work together. Mosque cards show state badge. Count displayed above results.
- **Map auto-zoom:** Replaced hardcoded Sydney center with `FitBounds` component that auto-zooms the Leaflet map to fit all visible mosques. Map height reduced from 500px to 350px so mosque list is visible on page load.
- **Hero banner update:** Changed "across Sydney" to "across Australia". Added community invite line: "Know what's happening at your local mosque? Help the community by adding it."
- **Admin mosque approval fix:** Added `state` field when inserting approved mosque suggestions (defaults to NSW).
- **Mosque detail page:** Now shows state alongside suburb.

### Decisions Made
- State stored as short code (NSW, VIC, etc.) not full name — shorter, easier to filter
- Default mosques page shows all states (not filtered to NSW) to showcase national coverage
- Unique constraint on mosque name prevents duplicate inserts during migration
- Map auto-fits to visible mosques rather than hardcoding a city center — works for any state
- Geocoding script kept as a reusable tool for future mosque additions

### Issues / Bugs
- 9 mosques needed manual approximate coordinates (Nominatim couldn't resolve exact addresses). Accuracy is suburb-level, sufficient for map display.
- `mosque_suggestions` table doesn't have a `state` column yet — admin approval defaults to NSW

### Next Session
- Set up Cloudflare Pages for auto-deploy from GitHub
- Set up Cloudflare R2 bucket and configure credentials
- Generate PWA icons
- QA pass: test all flows on mobile (especially state filtering, map zoom)
- Seed more events (especially for non-NSW mosques)
- Add rate limiting to submission and report endpoints
- Add `state` column to `mosque_suggestions` table and suggestion form

### Open Questions
- Go Pray database access and format (still pending)
- halaqas.com domain registration
- Cloudflare account setup (for Pages + R2)

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
