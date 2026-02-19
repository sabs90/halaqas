# Halaqas — Product Requirements Document (PRD)

## 1. Overview

Halaqas is a free, public website that aggregates Islamic events and programs across Sydney mosques into a single searchable, filterable directory with subscribable calendars per mosque.

## 2. User Personas

### The Seeker (Primary)

**Profile:** Muslim in Sydney who wants to attend a talk, class, or event this week but doesn't know what's available beyond their immediate circle.

**Context:** May not be connected to many WhatsApp groups. Especially active during Ramadan when they want to do more — attend taraweeh at different mosques, find iftar events, discover special lecture series.

**Needs:** A quick way to browse what's on, filter by location and time, and get event details without joining 15 WhatsApp groups.

### The Regular

**Profile:** Practising Muslim who attends their local mosque regularly but wants to discover events at other mosques — a visiting scholar, a specialised class, a community iftar.

**Needs:** Ability to subscribe to calendars from multiple mosques so new events appear automatically. Suburb-based filtering to find events nearby.

### The Newcomer

**Profile:** New to Sydney, new to practising, or simply doesn't have established community networks yet. Has no WhatsApp groups, doesn't know which mosques run what.

**Needs:** A welcoming, low-barrier entry point to discover the breadth of what Sydney's Muslim community offers. Map view to find mosques near them.

### The Contributor

**Profile:** Active community member who sees flyers, receives WhatsApp announcements, and wants to help others find events. May be associated with a specific mosque.

**Needs:** A fast, frictionless way to submit event info — ideally just uploading a flyer image and confirming the AI-extracted details.

## 3. User Stories

### Browsing & Discovery

- As a **seeker**, I want to see all upcoming events across Sydney mosques so I can find something to attend this week
- As a **seeker**, I want to filter events by suburb and radius so I only see events near me
- As a **seeker**, I want to filter by event type (talk, class, Quran circle, iftar, etc.) so I can find what interests me
- As a **seeker**, I want to filter by language so I can find events I'll understand
- As a **seeker**, I want to filter by gender (brothers/sisters/mixed) so I know I can attend
- As a **seeker**, I want to see events on a map so I can visually find what's nearby
- As a **regular**, I want to browse a specific mosque's page to see everything they have coming up

### Calendar Subscription

- As a **regular**, I want to subscribe to a mosque's calendar so new events automatically appear in my Google/Apple/Outlook calendar
- As a **regular**, I want the calendar to show accurate times, including prayer-anchored events that shift with the seasons

### Event Submission

- As a **contributor**, I want to upload a flyer image and have the system extract event details automatically so I don't have to type everything manually
- As a **contributor**, I want to paste a WhatsApp text message and have the system extract event details so I can quickly share what I've received
- As a **contributor**, I want to manually fill in event details as a fallback when I don't have a flyer or text message
- As a **contributor**, I want to review and correct AI-extracted details before the event goes live so the information is accurate
- As a **contributor**, I want to submit events for non-mosque venues (community halls, lecture theatres, etc.)

### Sharing

- As a **seeker**, I want to share an event via WhatsApp with a single tap so I can tell friends about it
- As a **seeker**, I want shared links to show a rich preview (title, mosque, date/time) in WhatsApp so people know what I'm sharing

### Reporting & Quality

- As a **visitor**, I want to report that a recurring event has ended so the listing stays accurate
- As a **visitor**, I want to report incorrect details and submit corrections so the information improves over time

### Administration

- As an **admin**, I want to review reported amendments (old details vs new details) and approve or reject them
- As an **admin**, I want to de-list a mosque if they request removal
- As an **admin**, I want recurring events to auto-archive after 3 months of inactivity so stale listings don't accumulate

## 4. MVP Features

### 4.1 Public Event Directory

- Filterable list of upcoming events across all mosques
- Filters: mosque, suburb (5km radius), date/date range, event type, language, gender
- Each event displays: title, mosque name, date, time (with prayer anchor if applicable), event type, speaker (if known), language, gender, source flyer image
- Recurring events supported with visual indicator
- Stale recurring events (3+ months unconfirmed) shown greyed out with "may no longer be running" label

### 4.2 Mosque Directory

- Comprehensive list of Sydney mosques seeded from Go Pray database
- Each mosque has a dedicated page showing all upcoming and recurring events
- Address, map pin, and link to Go Pray for prayer times

### 4.3 Map View

- Interactive map (Leaflet + OpenStreetMap) showing mosques with upcoming events
- Click a mosque pin to see its upcoming events
- "Near me" geolocation option for finding nearby events

### 4.4 Calendar Subscription

- Each mosque has a dynamically generated .ics feed URL
- Users can subscribe from any calendar app (Google Calendar, Apple Calendar, Outlook)
- Feed updates automatically as events are added/modified
- Prayer-anchored events display with calculated clock times

### 4.5 Event Submission Flow

- Three input paths: image upload, text paste, manual form
- AI parsing via Groq API (Llama 4 Scout) with structured JSON extraction
- Editable confirmation screen showing extracted details with missing fields highlighted
- Mosque selection from Go Pray database dropdown, or "Other Venue" with manual address entry
- Fields: title, mosque/venue, date, time (fixed or prayer-anchored), event type, speaker(s), language, gender, recurring (yes/no + pattern), description (optional)
- Source image stored and displayed on event page
- Event goes live immediately upon user confirmation

### 4.6 Prayer-Anchored Times

- Events can be linked to a prayer (Fajr, Dhuhr, Asr, Maghrib, Isha) with an offset (e.g. "15 min after Isha")
- Prayer times calculated using Adhan.js with Sydney coordinates and Shafi'i methodology
- Recalculated weekly (daily during Ramadan)
- Displayed as: "After Isha (~8:12 PM this week)"

### 4.7 Share Button

- WhatsApp-optimised share button on each event
- Generates a link with Open Graph meta tags for rich preview in WhatsApp

### 4.8 Report Issue Flow

- "Report issue" button on each event
- Reason selection: event ended, wrong date/time, wrong details, duplicate, other
- "Wrong details" option shows editable event fields with current values pre-filled
- Amended submissions go to admin review queue (not live immediately)

### 4.9 Admin Interface

- Password-protected admin page
- Review queue showing reported amendments: old details vs new details side by side
- Approve or reject buttons
- Ability to de-list a mosque
- View and manage all events (edit, delete, archive)

## 5. Out of Scope (MVP)

- Native mobile app (PWA/add-to-home-screen only)
- Multi-language interface (English only for MVP)
- Push notifications or email alerts
- Automated scraping from Facebook pages or other sources
- Individual mosque admin accounts or self-service portals
- User accounts, login, or authentication (for public users)
- Comments, ratings, reviews, or social features
- Revenue model, ads, or sponsorship
- Integration with other cities or countries

## 6. Success Metrics

| Metric | Target (first 3 months) |
|--------|------------------------|
| Mosques with active events listed | 30+ |
| Total events listed | 100+ |
| Monthly unique visitors | 500+ |
| Community-submitted events (not seeded by admin) | 50+ |
| Calendar subscriptions | 50+ |
| Events shared via WhatsApp | 100+ |

These are directional targets, not hard commitments. The primary success signal is whether the community starts submitting events without prompting — that indicates the platform is delivering value and has organic momentum.
