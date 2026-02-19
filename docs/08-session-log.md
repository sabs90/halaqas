# Halaqas — Session Log

This file is the persistent memory between Claude Code sessions. Each entry summarises what was built, what changed, and what's next. Read from top (most recent) to bottom (oldest).

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

### Issues / Bugs
- None yet (pre-development)

### Next Session
- Start with Milestone 1.1: Foundation setup
  - Create Next.js project with App Router
  - Configure Tailwind CSS with the custom theme from 07-style-guide.md
  - Set up Cloudflare Pages for auto-deploy from GitHub
  - Set up Supabase project and create database schema (mosques, events, amendments tables)
  - Set up Cloudflare R2 bucket for image storage
  - Import Go Pray mosque database into Supabase

### Open Questions
- Confirm Go Pray database access and format (talk to friend)
- Register halaqas.com domain
- Set up Groq API account and get API key
- Set up Cloudflare account
- Set up Supabase account
