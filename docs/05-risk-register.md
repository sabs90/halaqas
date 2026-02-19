# Halaqas — Risk Register

## Risk Scoring

- **Likelihood:** Low / Medium / High
- **Impact:** Low / Medium / High
- **Overall:** Combination of likelihood × impact

---

## Adoption Risks

### R1: Community doesn't submit events after initial seed

| Field | Detail |
|-------|--------|
| **Category** | Adoption |
| **Likelihood** | Medium |
| **Impact** | High |
| **Overall** | High |
| **Description** | The platform's long-term value depends on community contributions. If submissions don't materialise organically, the site becomes stale after the initial seed and loses relevance. |
| **Mitigation** | Launch during Ramadan when engagement is highest. Make submission flow as frictionless as possible (upload a photo, confirm, done). Leverage Go Pray's community. Seed generously with 20 mosques so there's value from day one. Track submission rates closely and proactively recruit contributors from active WhatsApp groups if needed. |
| **Contingency** | If submissions remain low after Ramadan, consider reaching out to 2–3 active mosques to establish dedicated contributors rather than relying on fully open crowdsourcing. |

### R2: Insufficient visitor traffic to justify the effort

| Field | Detail |
|-------|--------|
| **Category** | Adoption |
| **Likelihood** | Medium |
| **Impact** | Medium |
| **Overall** | Medium |
| **Description** | If people don't discover or return to the site, the platform fails regardless of content quality. WhatsApp groups may remain the preferred channel. |
| **Mitigation** | WhatsApp share button creates a viral loop — every shared event is a free advertisement. Calendar subscriptions create retention without requiring site visits. SEO optimisation for "mosque events Sydney" and similar queries. Go Pray endorsement provides initial traffic. |
| **Contingency** | If traffic is very low, the calendar subscription model still delivers value to those who have subscribed, even without high web traffic. Consider whether a leaner "calendar-only" approach is sufficient. |

### R3: Mosques object to being listed

| Field | Detail |
|-------|--------|
| **Category** | Adoption / Community |
| **Likelihood** | Low |
| **Impact** | Low |
| **Overall** | Low |
| **Description** | Some mosques may not want their events listed on a third-party platform, or may object to specific events being shared publicly. |
| **Mitigation** | "Better to ask forgiveness than permission" — list by default, de-list immediately on request. De-listing is a single admin action. Include a clear contact method on the site. Frame Halaqas as a community service that increases mosque visibility and attendance. |
| **Contingency** | If multiple mosques push back, reconsider the opt-out model and potentially shift to opt-in for sensitive cases. |

---

## Data Quality Risks

### R4: AI parsing produces inaccurate event details

| Field | Detail |
|-------|--------|
| **Category** | Data Quality |
| **Likelihood** | Medium |
| **Impact** | Medium |
| **Overall** | Medium |
| **Description** | Flyers vary enormously in design, language, quality, and completeness. The AI may misread dates, confuse speakers, or miss key details. Incorrect listings erode trust. |
| **Mitigation** | User confirmation step catches most errors before publishing. Display source flyer image on event page so users can verify. Iteratively improve the AI prompt based on real submission data. Fall back to Gemini Flash for low-confidence extractions. Manual form option as ultimate fallback. |
| **Contingency** | If AI parsing is consistently unreliable, simplify to a semi-manual flow: AI pre-fills what it can, user completes the rest. Even partial extraction saves time over fully manual entry. |

### R5: Stale / ghost recurring events accumulate

| Field | Detail |
|-------|--------|
| **Category** | Data Quality |
| **Likelihood** | High |
| **Impact** | Medium |
| **Overall** | High |
| **Description** | Recurring events (e.g. "Sheikh X teaches every Thursday") will inevitably become outdated — classes end, speakers leave, schedules change. Without a mechanism to clean these up, the directory becomes unreliable. |
| **Mitigation** | Auto-archive after 3 months of no confirmation (greyed out, "may no longer be running"). Community "report issue" flow for flagging ended events. Periodic manual sweeps by admin. |
| **Contingency** | If stale events become a major trust issue, introduce a periodic "is this still running?" email/SMS to the original submitter (requires storing contact info, which is already optional in the schema). |

### R6: Spam or malicious submissions

| Field | Detail |
|-------|--------|
| **Category** | Data Quality |
| **Likelihood** | Low |
| **Impact** | Medium |
| **Overall** | Low |
| **Description** | Without user accounts, anyone can submit events. This could be exploited for spam, joke submissions, or inappropriate content. |
| **Mitigation** | Rate limiting on submission endpoints. AI parsing adds a natural barrier (random text/images won't produce valid event data). Mosque dropdown constrains venue selection. Community reporting for inappropriate content. Admin can delete immediately. |
| **Contingency** | If spam becomes a problem, add simple CAPTCHA or require an email confirmation step before publishing. |

---

## Technical Risks

### R7: Groq API unavailability or pricing changes

| Field | Detail |
|-------|--------|
| **Category** | Technical |
| **Likelihood** | Low |
| **Impact** | Medium |
| **Overall** | Low |
| **Description** | Groq is a relatively young company. API availability, pricing, or model support could change. |
| **Mitigation** | Gemini Flash as a configured fallback. The AI parsing is behind an abstraction layer (API route), so swapping providers requires changing one file. OpenAI-compatible API means many providers are drop-in replacements. |
| **Contingency** | Worst case, fall back to manual-only submission with no AI parsing. The platform still works — it's just slower to submit. |

### R8: Supabase free tier limits exceeded

| Field | Detail |
|-------|--------|
| **Category** | Technical |
| **Likelihood** | Low |
| **Impact** | Medium |
| **Overall** | Low |
| **Description** | Supabase free tier allows 500MB database storage and 1GB file storage. If the platform grows significantly, these limits could be reached. |
| **Mitigation** | At expected scale (hundreds of events, not thousands), 500MB is enormous. Image storage is on Cloudflare R2 (separate 10GB free tier). Monitor usage via Supabase dashboard. |
| **Contingency** | Supabase Pro is $25/month if needed — a very manageable step up if the platform has grown enough to hit limits. |

### R9: Cloudflare Pages build limits

| Field | Detail |
|-------|--------|
| **Category** | Technical |
| **Likelihood** | Low |
| **Impact** | Low |
| **Overall** | Low |
| **Description** | Cloudflare Pages free tier allows 500 builds per month. Rapid iteration during development could approach this. |
| **Mitigation** | 500 builds is roughly 16 per day — more than sufficient even during active development. Batch changes rather than pushing every small fix. |
| **Contingency** | Cloudflare Pages Pro ($20/month) removes build limits if needed. |

---

## Community & Sensitivity Risks

### R10: Sectarian tensions or perceived bias

| Field | Detail |
|-------|--------|
| **Category** | Community |
| **Likelihood** | Low |
| **Impact** | High |
| **Overall** | Medium |
| **Description** | Sydney's Muslim community includes diverse schools of thought, cultural backgrounds, and occasionally tensions. A platform listing "all mosques" could be perceived as endorsing certain groups, or could surface events that some community members find objectionable. |
| **Mitigation** | Position Halaqas as agnostic and inclusive — same approach as Go Pray. No editorial curation or recommendation of specific mosques or events. The platform is a directory, not a recommendation engine. Avoid any branding or language that associates with a particular group. |
| **Contingency** | If specific communities raise concerns, engage directly and respectfully. De-list specific mosques or events if there's a legitimate complaint. Consider an advisory group of diverse community members if this becomes a recurring issue. |

### R11: Privacy concerns around event submission

| Field | Detail |
|-------|--------|
| **Category** | Community |
| **Likelihood** | Low |
| **Impact** | Low |
| **Overall** | Low |
| **Description** | Some community members may be uncomfortable with event information being aggregated on a public website, particularly for sisters-only events or events at private venues. |
| **Mitigation** | All information listed on Halaqas is already public (flyers, Facebook posts, WhatsApp broadcasts). No private information is surfaced. De-list on request. Optional contact field for submitters is stored but never displayed publicly. |
| **Contingency** | Add a "request removal" link on every event page for quick self-service removal. |

---

## Sustainability Risks

### R12: Solo maintainer burnout or unavailability

| Field | Detail |
|-------|--------|
| **Category** | Sustainability |
| **Likelihood** | Medium |
| **Impact** | High |
| **Overall** | High |
| **Description** | The platform is built and maintained by one person. Life events (new baby arriving November 2025, work commitments, Ramadan itself) could reduce capacity. If the admin is unavailable, the review queue stalls and no maintenance occurs. |
| **Mitigation** | Design for minimal maintenance — auto-archive handles stale events, no user accounts means no support burden, infrastructure is serverless. Plan for volunteer admins in Phase 2. Keep the admin review flow simple enough that a trusted friend could step in with 5 minutes of explanation. |
| **Contingency** | If capacity becomes an issue, temporarily disable the amendment review flow (let events stay as-is) and focus only on critical issues. The site continues to function without active admin attention — it just doesn't improve. |

### R13: Post-Ramadan usage cliff

| Field | Detail |
|-------|--------|
| **Category** | Sustainability |
| **Likelihood** | High |
| **Impact** | Medium |
| **Overall** | High |
| **Description** | Ramadan is the natural peak for Islamic event attendance and interest. After Ramadan, engagement may drop sharply. The platform could feel abandoned. |
| **Mitigation** | Calendar subscriptions provide passive retention — users who subscribed during Ramadan continue to receive updates. Recurring events (weekly classes, regular talks) maintain year-round value. Position Halaqas as a year-round resource, not just a Ramadan tool. |
| **Contingency** | If post-Ramadan usage drops to near-zero, accept that the platform's primary value is seasonal and plan to reactivate and reseed each Ramadan. This is still a valuable community service with near-zero ongoing cost. |

---

## Risk Summary

| Risk | Overall | Key Mitigation |
|------|---------|---------------|
| R1: No community submissions | **High** | Frictionless submission, Ramadan launch timing |
| R5: Stale recurring events | **High** | Auto-archive, community reporting |
| R12: Solo maintainer burnout | **High** | Minimal-maintenance design, volunteer admin plan |
| R13: Post-Ramadan usage cliff | **High** | Calendar subscriptions, recurring events |
| R2: Low visitor traffic | Medium | WhatsApp sharing loop, SEO, Go Pray endorsement |
| R4: AI parsing inaccuracy | Medium | User confirmation step, prompt iteration |
| R10: Sectarian tensions | Medium | Agnostic positioning, de-list on request |
| R3: Mosque pushback | Low | De-list on request |
| R6: Spam submissions | Low | Rate limiting, AI as natural barrier |
| R7: Groq API changes | Low | Gemini fallback, abstraction layer |
| R8: Supabase limits | Low | Well within free tier |
| R9: Cloudflare build limits | Low | Well within free tier |
| R11: Privacy concerns | Low | All info already public, removal on request |
