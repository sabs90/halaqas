# Halaqas — Project Brief

## The Problem

Event information across Sydney's mosques is fragmented. Talks, classes, Quran circles, and community programs are announced through mosque-specific WhatsApp groups, occasional Facebook posts, and physical flyers. There is no single place to discover what's happening across the city. People miss events they'd attend, mosques get lower turnout than they could, and newcomers or seekers — especially during Ramadan — have no entry point at all.

## The Solution

**Halaqas** (حلقات — "circles/gatherings") is a free, public, mobile-first website that collates events across Sydney mosques into a single filterable directory with subscribable calendars.

Think of it as the missing layer on top of Go Pray: Go Pray tells you *where* to pray, Halaqas tells you *what's on*.

## Target Community

The Sydney Muslim community — primarily "seekers" who want to attend a talk, class, or gathering and don't know what's available. Especially valuable during Ramadan when demand peaks and programs multiply.

## How It Works

1. **Browse** — Visit halaqas.com and filter events by mosque, suburb (5km radius), date, event type, language, or gender
2. **Subscribe** — Add any mosque's calendar to your Google/Apple/Outlook calendar for live updates
3. **Discover** — View events on a map to find what's happening near you
4. **Contribute** — Anyone can submit an event by uploading a flyer image, pasting a WhatsApp message, or filling in a form. AI extracts the details, the submitter confirms, and it goes live
5. **Share** — Share events directly to WhatsApp with a single tap

## Data Strategy

- **Launch:** Manually seed the top 20 Sydney mosques with current events
- **Ongoing:** Community crowdsourced submissions with AI-assisted parsing and user confirmation
- **Mosque directory:** Sourced from Go Pray's comprehensive database
- **Quality:** Community can report issues; amendments go through admin review

## Hosting & Cost Approach

| Component | Service | Cost |
|-----------|---------|------|
| Hosting & CDN | Cloudflare Pages | Free |
| Database | Supabase (free tier) | Free |
| AI flyer parsing | Groq API (Llama 4 Scout) | ~$0.20/1,000 submissions |
| Image storage | Cloudflare R2 | Free (10GB tier) |
| Maps | Leaflet + OpenStreetMap | Free |
| Prayer times | Adhan.js (client-side) | Free |
| Calendars | Self-hosted .ics feeds | Free |

**Estimated total ongoing cost: $0–5/month**

## Project Status

Not-for-profit community project. Personally funded. Built and maintained by a solo developer using Claude Code. No revenue model. No user accounts.

## Target Launch

Ramadan 2026 (late February / early March) — the natural peak in demand for Islamic events and programs across Sydney.
