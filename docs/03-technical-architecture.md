# Halaqas — Technical Architecture & Stack

## 1. Design Principles

- **Minimal ongoing cost:** Stay within free tiers wherever possible
- **Solo maintainability:** Everything buildable and debuggable by one non-professional developer using Claude Code
- **Simplicity over features:** Fewer moving parts, fewer things to break
- **Mobile-first:** Majority of users will access via phone browsers

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js (App Router) | React-based, SSR/SSG support, API routes for backend logic, excellent Claude Code support |
| **Hosting** | Netlify | Free tier with auto-deploy from GitHub, currently at halaqas.netlify.app |
| **Database** | Supabase (PostgreSQL) | Free tier (500MB, 50K monthly active users), REST API, built-in dashboard, row-level security |
| **AI Parsing** | Groq API — Llama 4 Scout | Vision + JSON mode, $0.11/$0.34 per million tokens, OpenAI-compatible API |
| **AI Fallback** | Google Gemini 2.5 Flash | Backup for edge cases where Llama 4 Scout struggles, $0.15/$0.60 per million tokens |
| **Image Storage** | Supabase Storage | 1GB free (included with Supabase), no extra service needed |
| **Maps** | Leaflet + OpenStreetMap | Fully free, no API key, lightweight |
| **Prayer Times** | Adhan.js | Open source, runs client-side or server-side, supports Shafi'i calculation method |
| **Calendars** | Dynamic .ics generation | No third-party dependency, works with all calendar apps |
| **Styling** | Tailwind CSS | Utility-first, ships minimal CSS, great for mobile-first responsive design |

## 3. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                      Netlify                            │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Next.js SSR  │  │  Static Pages │  │  API Routes │ │
│  │  (Event pages,│  │  (Home, About,│  │  /api/...   │ │
│  │   Mosque pages│  │   Map view)   │  │             │ │
│  └──────┬───────┘  └──────────────┘  └──────┬──────┘ │
│         │                                     │        │
└─────────┼─────────────────────────────────────┼────────┘
          │                                     │
          ▼                                     ▼
┌──────────────────┐              ┌──────────────────────┐
│    Supabase       │              │    External APIs      │
│  ┌──────────────┐ │              │  ┌────────────────┐  │
│  │  PostgreSQL   │ │              │  │  Groq API      │  │
│  │  - events     │ │              │  │  (AI parsing)  │  │
│  │  - mosques    │ │              │  └────────────────┘  │
│  │  - amendments │ │              │  ┌────────────────┐  │
│  └──────────────┘ │              │  │  Gemini Flash   │  │
│                    │              │  │  (fallback)     │  │
│                    │              │  └────────────────┘  │
└──────────────────┘              └──────────────────────┘

                                    ┌──────────────────────┐
                                    │  Client-side          │
                                    │  ┌────────────────┐  │
                                    │  │  Adhan.js       │  │
                                    │  │  (prayer times) │  │
                                    │  ├────────────────┤  │
                                    │  │  Leaflet        │  │
                                    │  │  (map view)     │  │
                                    │  └────────────────┘  │
                                    └──────────────────────┘
```

## 4. Database Schema

### mosques

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | text | Mosque name (unique constraint) |
| address | text | Full street address |
| suburb | text | Suburb name (for filtering) |
| state | text | Australian state/territory code (NSW, VIC, QLD, WA, SA, ACT, NT, TAS) |
| latitude | decimal | Geocoded coordinates |
| longitude | decimal | Geocoded coordinates |
| active | boolean | Default true, false if de-listed |
| go_pray_id | text | Reference to Go Pray database |
| created_at | timestamptz | |

### events

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| mosque_id | uuid | FK to mosques (nullable for non-mosque venues) |
| venue_name | text | For non-mosque venues |
| venue_address | text | For non-mosque venues |
| venue_latitude | decimal | For non-mosque venues |
| venue_longitude | decimal | For non-mosque venues |
| title | text | Event title |
| description | text | Optional description |
| event_type | enum | talk, class, quran_circle, iftar, taraweeh, charity, youth, halaqa, tahajjud, itikaf, competition, workshop, other |
| speaker | text | Speaker name(s), nullable |
| language | enum | english, arabic, urdu, turkish, bahasa, mixed, other |
| gender | enum | brothers, sisters, mixed |
| time_mode | enum | fixed, prayer_anchored |
| fixed_date | date | For one-off fixed-time events |
| fixed_time | time | For fixed-time events |
| prayer_anchor | enum | fajr, dhuhr, asr, maghrib, isha (nullable) |
| prayer_offset_minutes | integer | Minutes after prayer (e.g. 15) |
| is_recurring | boolean | |
| recurrence_pattern | text | e.g. "every_thursday", "every_friday", "daily_ramadan" |
| recurrence_end_date | date | Optional explicit end date |
| flyer_image_url | text | URL to stored flyer in Supabase Storage |
| is_kids | boolean | Default false, true if event targets kids/children |
| is_family | boolean | Default false, true if event is family-oriented |
| submitter_contact | text | Optional email/phone (not displayed publicly) |
| status | enum | active, archived, delisted, pending_review |
| last_confirmed_at | timestamptz | For auto-archive logic |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### amendments

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| event_id | uuid | FK to events |
| reason | enum | ended, wrong_date, wrong_details, duplicate, other |
| old_details | jsonb | Snapshot of current event fields |
| new_details | jsonb | Proposed changes |
| reporter_contact | text | Optional |
| status | enum | pending, approved, rejected |
| created_at | timestamptz | |
| reviewed_at | timestamptz | |

### mosque_suggestions

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | text | Suggested mosque name |
| address | text | Optional address |
| suburb | text | Optional suburb |
| latitude | decimal | Optional coordinates |
| longitude | decimal | Optional coordinates |
| suggested_by_contact | text | Optional submitter contact |
| status | enum | pending, approved, rejected |
| created_at | timestamptz | |

### analytics_events

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| event_name | text | Action name (e.g. mosque_view, calendar_download_event) |
| mosque_id | uuid | FK to mosques (nullable), SET NULL on delete |
| event_id | uuid | FK to events (nullable), SET NULL on delete |
| metadata | jsonb | Optional extra data (default `{}`) |
| created_at | timestamptz | |

No PII stored. RLS: public insert only, reads via service role (admin). Indexes on `event_name`, `mosque_id`, `created_at`, and composite `(event_name, created_at)`.

## 5. Key API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/events` | GET | List events with filters (mosque, suburb, date, type, language, gender) |
| `/api/events` | POST | Submit a new event (after user confirmation). Auto-creates a mosque suggestion if venue_name is set without mosque_id. |
| `/api/events/[id]` | GET | Single event details |
| `/api/events/[id]/report` | POST | Submit an amendment/report |
| `/api/parse-image` | POST | Upload flyer image, return AI-extracted event data |
| `/api/parse-text` | POST | Submit text, return AI-extracted event data |
| `/api/mosques` | GET | List mosques (with optional suburb filter) |
| `/api/mosques/[id]/calendar.ics` | GET | Dynamic .ics feed for a mosque |
| `/api/admin/amendments` | GET | List pending amendments (protected) |
| `/api/admin/amendments/[id]` | POST | Approve or reject amendment (protected) |
| `/api/admin/events` | GET | List all events (protected) |
| `/api/admin/events` | PATCH/DELETE | Update or delete events (protected) |
| `/api/admin/mosques` | GET | List pending mosque suggestions; `?list=all` returns all mosques (protected) |
| `/api/admin/mosques` | POST | Approve or reject mosque suggestion (protected). On approve, auto-links unlinked events with matching venue_name; returns `linked_events` count. |
| `/api/admin/mosques` | PATCH | Update mosque details (protected) |
| `/api/admin/review` | GET | List events pending review (protected) |
| `/api/admin/review` | POST | Approve or reject a pending event (protected) |
| `/api/admin/parse-flyers` | POST | Parse single flyer image, return all extracted events + flyer URL (protected) |
| `/api/mosques/suggest` | POST | Submit a mosque suggestion |
| `/api/mosques/[id]/nicknames` | POST | Add a nickname for a mosque |
| `/api/geocode` | POST | Geocode an address |
| `/api/feedback` | POST | Send feedback email via Resend (to halaqas.au@gmail.com, from noreply@halaqas.au) |
| `/api/admin/health` | GET | Data health checks: orphaned events, duplicate mosques/events, stale recurring (protected) |
| `/api/admin/health` | POST | Health actions: link_event, merge_mosques, set_end_date, archive_event, delete_event (protected) |
| `/api/admin/counts` | GET | Pending counts for dashboard badges: submissions, amendments, suggestions, health (protected) |
| `/api/analytics` | POST | Public fire-and-forget analytics event insert (allowlisted event names) |
| `/api/admin/analytics` | GET | Aggregated analytics: page views, top mosques, recent activity (protected) |

## 6. AI Parsing Prompt Design

The AI parsing prompt for flyer images and text messages should extract structured event data. Example system prompt:

```
You are an event information extractor for Islamic community events in Sydney, Australia.

Given an image of a flyer or a text message about an event, extract the following fields as JSON:

{
  "title": "string — event title or topic",
  "mosque_or_venue": "string — name of mosque or venue",
  "date": "string — ISO date (YYYY-MM-DD) or null if unclear",
  "time": "string — HH:MM in 24hr format, or null",
  "prayer_anchor": "string — fajr/dhuhr/asr/maghrib/isha if time is relative to a prayer, or null",
  "prayer_offset": "string — e.g. 'after', '15 min after', '30 min before', or null",
  "speaker": "string — speaker name(s) or null",
  "event_type": "string — talk/class/quran_circle/iftar/taraweeh/charity/youth/sisters_circle/other",
  "language": "string — english/arabic/urdu/turkish/bahasa/mixed/other",
  "gender": "string — brothers/sisters/mixed",
  "is_recurring": "boolean",
  "recurrence_pattern": "string — e.g. 'every thursday', 'daily during ramadan', or null",
  "description": "string — any additional details, or null",
  "confidence": "number 0-1 — your overall confidence in the extraction"
}

If a field cannot be determined, set it to null. Prefer extracting partial information over returning nothing. Dates should be interpreted relative to the current date in Sydney, Australia.
```

## 7. Prayer Time Calculation

- Library: **Adhan.js** (open source, well-maintained)
- Calculation method: **Shafi'i** (Muslim World League angles with Shafi'i Asr calculation)
- Coordinates: Sydney CBD (-33.8688, 151.2093) as citywide proxy
- Recalculation frequency: Weekly (stored in database or generated on request), daily during Ramadan
- Display format: "After Isha (~8:12 PM this week)"

## 8. Calendar (.ics) Generation

Each mosque gets a dynamic .ics endpoint that generates a valid iCalendar feed:

- URL pattern: `halaqas.com/api/mosques/[id]/calendar.ics`
- Contains all active events for that mosque
- Prayer-anchored events include calculated clock times for the current week
- Recurring events use iCalendar RRULE for proper calendar integration
- Standard fields: SUMMARY, DTSTART, DTEND, LOCATION, DESCRIPTION, URL, DTSTAMP
- RFC 5545 compliant: VTIMEZONE block (Australia/Sydney), line folding at 75 octets, CRLF line endings

**Calendar UX:**
- **Single event:** Dropdown with Download .ics, Google Calendar (`action=TEMPLATE`), Outlook (web compose)
- **Mosque (all events):** Dropdown with Download .ics (one-time import) and Subscribe via `webcal://` (live-updating feed)
- Subscription requires the domain to resolve (webcal:// makes the calendar app fetch the URL directly)

## 9. Image Storage

- Flyer images uploaded during event submission are stored in Supabase Storage (`flyers` bucket, public)
- Images are compressed client-side before upload (no `sharp` — compatible with edge runtime)
- Served via Supabase's CDN (public bucket URLs)
- URL stored in the `flyer_image_url` column of the events table
- Upload function: `uploadFlyer()` in `src/lib/storage.ts`

## 10. Suburb / Radius Filtering

- Each mosque has latitude/longitude from Go Pray database
- Suburb-to-coordinates mapping via a static lookup table of Sydney suburbs (can be generated from public data)
- Filtering uses the Haversine formula to calculate distance: show all mosques within 5km of the selected suburb's centre
- This runs as a database query: `WHERE haversine(mosque.lat, mosque.lng, suburb.lat, suburb.lng) <= 5`
- Supabase supports PostGIS extensions for efficient geospatial queries if needed

## 11. Hosting & Deployment

- Code lives in a GitHub repository
- Netlify auto-deploys on push to `main` (currently at halaqas.netlify.app)
- Environment variables (Groq API key, Supabase URL/key, admin password, NEXT_PUBLIC_SITE_URL) stored in Netlify settings
- `NEXT_PUBLIC_SITE_URL` is baked in at build time — must redeploy after changing
- No CI/CD pipeline needed beyond Netlify's built-in build step

### Caching Strategy

- **ISR (Incremental Static Regeneration):** Home page revalidates every 60s, detail pages (`events/[id]`, `mosques`, `mosques/[id]`) every 300s (5 min). Pages served from cache, regenerated in background.
- **React `cache()`:** `getEvent()` and `getMosque()` wrapped with React's `cache()` to deduplicate DB queries within a single request (metadata + page component).
- **API Cache-Control headers:** Events GET API returns `public, max-age=60, stale-while-revalidate=300`. Calendar ICS returns `public, max-age=3600`.
- **Netlify static asset headers:** `/_next/static/*`, `*.js`, `*.css`, `/fonts/*` served with `max-age=31536000, immutable`.
- **Loading skeletons:** `loading.tsx` files for main routes provide instant feedback while data loads.

## 12. Cost Estimate

| Service | Free Tier Limit | Expected Usage | Monthly Cost |
|---------|----------------|----------------|-------------|
| Netlify | 100GB bandwidth, 300 build minutes/month | Well within limits | $0 |
| Supabase | 500MB database, 1GB file storage, 2GB bandwidth, 50K MAU | Well within limits (images ~3-9MB total) | $0 |
| Groq API | Pay per token | ~500 submissions/month peak | ~$0.10 |
| Gemini Flash (fallback) | Free tier available | Occasional use | $0 |
| Domain name | N/A | halaqas.com or similar | ~$12/year |

**Total estimated cost: ~$1–2/month** (essentially just the domain name amortised, plus negligible API costs)

## 13. Security Considerations

- No user accounts or personal data stored (beyond optional submitter contact info)
- Admin interface protected by a strong password or magic link
- Supabase Row Level Security (RLS) enabled: public read on events/mosques, restricted write via API routes
- Rate limiting on submission endpoints to prevent spam
- Image uploads validated for file type and size before processing
- Groq API key stored as environment variable, never exposed to client
