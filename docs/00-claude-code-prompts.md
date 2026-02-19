# Halaqas — Claude Code Session Prompts

## How to Use

Copy-paste the **Start Prompt** at the beginning of every new Claude Code session to give it full context. Copy-paste the **End Prompt** before closing a session to ensure all progress is captured in the docs.

---

## Start Prompt

```
You are helping me build Halaqas (حلقات), a free community website that aggregates Islamic events and programs across Sydney mosques into a single searchable directory with subscribable calendars.

Before writing any code, read the following project documentation in the /docs folder:

1. /docs/01-project-brief.md — High-level overview: problem, solution, target community, cost approach
2. /docs/02-prd.md — User personas, user stories, MVP features, out-of-scope items, success metrics
3. /docs/03-technical-architecture.md — Tech stack, system architecture, database schema, API routes, AI parsing prompt, prayer time calculation, cost estimates
4. /docs/04-mvp-roadmap.md — Phased milestones with checkboxes, effort estimates, dependencies
5. /docs/05-risk-register.md — Adoption, technical, data quality, community, and sustainability risks
6. /docs/06-adoption-outreach-plan.md — Launch strategy, outreach plan, key contacts
7. /docs/07-style-guide.md — Complete visual design system: colours, typography, spacing, component specs, Tailwind config, CSS variables, accessibility notes
8. /docs/08-session-log.md — Log of all previous work sessions. Read this to understand what has already been built, what's in progress, and what to work on next.

Key technical decisions already made:
- Framework: Next.js (App Router) with Tailwind CSS
- Hosting: Cloudflare Pages (auto-deploy from GitHub)
- Database: Supabase (PostgreSQL)
- AI parsing: Groq API with Llama 4 Scout (vision + JSON mode)
- Prayer times: Adhan.js (Shafi'i method, Sydney coordinates)
- Calendars: Dynamic .ics feed generation per mosque
- Maps: Leaflet + OpenStreetMap
- Image storage: Cloudflare R2
- No user accounts, no login for public users
- Admin interface is password-protected

Design: Earthy Teal theme — see 07-style-guide.md for the full design system including Tailwind config, colour palette, component specs, and typography.

After reading the docs, check the session log for what was completed last session and what's next. Then confirm what you understand the current state to be and ask me what I'd like to work on today.
```

---

## End Prompt

```
We're wrapping up this session. Before we finish, please update the project documentation to reflect all work completed today:

1. **Update /docs/04-mvp-roadmap.md:**
   - Check off any completed milestones/tasks (change [ ] to [x])
   - Add any new tasks that emerged during this session
   - Update effort estimates if our understanding has changed

2. **Update /docs/08-session-log.md:**
   - Add a new entry at the top with today's date
   - Summarise what was built, changed, or decided today
   - List any bugs found or issues encountered
   - Note what's ready to work on next session
   - Note any open questions or decisions that need to be made

3. **Update /docs/03-technical-architecture.md** (if applicable):
   - If we changed the schema, added new API routes, or made architectural decisions, update the relevant sections

4. **Update /docs/05-risk-register.md** (if applicable):
   - If we discovered new risks or mitigated existing ones, update accordingly

5. **Update any other doc** that has become outdated based on today's work.

Format for the session log entry:

---
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
---

Please make all the doc updates now, then give me a brief summary of what was updated.
```

---

## Initial Session Log

The file below should be created as `/docs/08-session-log.md` before your first Claude Code session:

```markdown
# Halaqas — Session Log

This file is the persistent memory between Claude Code sessions. Each entry summarises what was built, what changed, and what's next. Read from top (most recent) to bottom (oldest).

---

## Session — [DATE OF FIRST SESSION]

### Completed
- Initial project setup (to be filled in after first session)

### Decisions Made
- (to be filled in)

### Issues / Bugs
- (to be filled in)

### Next Session
- Start with Milestone 1.1: Foundation setup
- Set up Next.js project, Tailwind CSS, Cloudflare Pages, Supabase
- Import Go Pray mosque database

### Open Questions
- Confirm Go Pray database access and format with friend
- Register halaqas.com domain
- Set up Groq API account
```

---

## Tips for Effective Sessions

- **Keep sessions focused.** Work on one milestone or feature per session where possible. This keeps the session log clean and makes it easy to pick up where you left off.
- **Don't skip the end prompt.** The doc updates are what give the next session its context. Skipping this means the next session starts blind.
- **If a session goes long**, you can use the end prompt mid-session to checkpoint progress, then continue.
- **If Claude Code loses context** in a long session, paste the start prompt again — it will re-read the docs and catch up.
- **The session log is append-only.** Never delete old entries. They're your project history.
