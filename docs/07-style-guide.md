# Halaqas — Style & Design Guide

## Design Direction

Earthy teal — grounded and warm with a cooler, sophisticated primary. Clean modern typography with moderate Islamic geometric accents. The site should feel trustworthy and community-oriented — like a well-maintained community noticeboard, not a corporate product.

## Brand

- **Name:** Halaqas (حلقات)
- **Bilingual logo:** English "Halaqas" alongside Arabic "حلقات"
- **Tagline:** "Discover talks, classes, and events at mosques across Sydney"
- **Positioning:** Agnostic, inclusive, community-powered. Companion to Go Pray.

---

## Colour Palette

### Primary — Earthy Teal

The main brand colour. Used for headers, primary buttons, active states, hero area, and navigation.

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Teal | `#1E5248` | `--color-primary` | Primary buttons, header/hero background, active filter pills, links |
| Teal Light | `#26695D` | `--color-primary-light` | Hover states on primary elements |
| Teal Dark | `#153D36` | `--color-primary-dark` | Pressed states, dark backgrounds, footer |

### Secondary — Terracotta

Warm accent colour. Creates contrast against the cool primary. Used for mosque names, secondary CTAs, and emphasis.

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Terracotta | `#C4704B` | `--color-secondary` | Mosque names on event cards, secondary buttons, "Submit Event" CTA |
| Terracotta Light | `#D4896A` | `--color-secondary-light` | Hover states on secondary elements |
| Terracotta Dark | `#A85A38` | `--color-secondary-dark` | Pressed states |

### Neutrals — Sand & Stone

The foundation. Backgrounds, text, borders, and supporting UI.

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Cream | `#FDFBF7` | `--color-cream` | Page background |
| Sand | `#F2EEE6` | `--color-sand` | Section backgrounds, info boxes |
| Sand Dark | `#E4DDD2` | `--color-border` | Borders, dividers, inactive filter pills, card outlines |
| Stone | `#9C9590` | `--color-text-light` | Captions, metadata, placeholder text, timestamps |
| Warm Gray | `#6B6560` | `--color-text-mid` | Body text, secondary information, event metadata |
| Charcoal | `#2C2825` | `--color-text-dark` | Headings, primary text, event titles, high-emphasis content |

### Accents

Used sparingly for tags, badges, and special states.

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Sea Sage | `#7AA89A` | `--color-accent-sage` | Arabic text in hero, success states, positive indicators |
| Deep Sage | `#5A7A6E` | `--color-accent-deep` | "Class" event type tag, recurring event badges |
| Gold | `#C49A3C` | `--color-accent-gold` | "Quran Circle" event type tag, special highlights, Ramadan accents |

---

## Typography

### Font Family

**Plus Jakarta Sans** — a clean, geometric sans-serif with warmth. Highly legible on mobile, modern without being sterile.

- Source: [Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- Weights used: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold), 800 (extra-bold)
- Load via: `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`

### Type Scale

| Element | Size | Weight | Colour | Line Height | Usage |
|---------|------|--------|--------|-------------|-------|
| Hero Title | 36px | 800 | White (on hero) / Charcoal | 1.2 | Main hero heading, bilingual logo |
| Page Heading | 28px | 700 | Charcoal | 1.3 | Page titles ("Events This Week", mosque names) |
| Section Heading | 20px | 700 | Charcoal | 1.3 | Section headers within pages |
| Card Title | 17px | 700 | Charcoal | 1.3 | Event titles on cards |
| Body Text | 15px | 400 | Warm Gray | 1.6 | Descriptions, paragraphs, general content |
| Caption / Meta | 13px | 500 | Stone | 1.4 | Time, language, gender metadata on event cards |
| Tag / Label | 11px | 600 | Varies | 1.2 | Event type badges, status labels. Uppercase with `letter-spacing: 0.05em` |

### Typography Rules

- Never use italic in the UI
- Arabic text (حلقات) in the logo uses Sea Sage (`#7AA89A`) at a lighter weight for contrast
- All caps reserved for tags/labels only — never for headings or body text
- Minimum body text size: 14px on mobile

---

## Spacing System

Use multiples of 4px consistently.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| xs | 4px | `gap-1` / `p-1` | Icon-to-label gaps |
| sm | 8px | `gap-2` / `p-2` | Between related elements (tag pills, inline items) |
| md | 12px | `gap-3` / `p-3` | Between card content sections |
| lg | 16px | `gap-4` / `p-4` | Between elements within a card |
| xl | 24px | `gap-6` / `p-6` | Between cards, between sections |
| 2xl | 32px | `gap-8` / `p-8` | Between major page sections |
| 3xl | 48px | `gap-12` / `p-12` | Hero padding, page-level vertical rhythm |

---

## Border Radius

| Element | Radius | Tailwind |
|---------|--------|----------|
| Cards | 12px | `rounded-card` |
| Buttons | 10px | `rounded-button` |
| Tags / Badges | 6px | `rounded-tag` |
| Filter Pills | 20px | `rounded-pill` |
| Input Fields | 10px | `rounded-button` |
| Hero / Section blocks | 14–16px | `rounded-2xl` |

---

## Shadows & Elevation

Minimal. The design relies on borders and background contrast, not depth.

| State | Value |
|-------|-------|
| Default (cards) | None — use `border: 1px solid #E4DDD2` |
| Hover (cards) | `box-shadow: 0 4px 20px rgba(30, 82, 72, 0.08); border-color: #1E5248` |
| Modals / Overlays | `box-shadow: 0 8px 32px rgba(44, 40, 37, 0.12)` |
| Dropdowns | `box-shadow: 0 4px 16px rgba(44, 40, 37, 0.08)` |

---

## Islamic Geometric Pattern

Subtle overlapping-circles pattern used as a background accent on the hero and page headers only. Never on content areas or cards.

### Implementation

```svg
<!-- Repeating pattern unit: 60×60px overlapping circles -->
<pattern id="islamicGeo" width="60" height="60" patternUnits="userSpaceOnUse">
  <circle cx="30" cy="30" r="20" fill="none" stroke="#FFFFFF" stroke-width="0.5" opacity="0.07"/>
  <circle cx="0"  cy="0"  r="20" fill="none" stroke="#FFFFFF" stroke-width="0.5" opacity="0.07"/>
  <circle cx="60" cy="0"  r="20" fill="none" stroke="#FFFFFF" stroke-width="0.5" opacity="0.07"/>
  <circle cx="0"  cy="60" r="20" fill="none" stroke="#FFFFFF" stroke-width="0.5" opacity="0.07"/>
  <circle cx="60" cy="60" r="20" fill="none" stroke="#FFFFFF" stroke-width="0.5" opacity="0.07"/>
</pattern>
```

### Rules

- Only appears on dark (Primary Teal) backgrounds
- White stroke, 0.5px width, 0.07 opacity
- Never on cards, content areas, or light backgrounds
- Render as inline SVG, positioned absolute within the hero container

---

## Component Specifications

### Event Cards

```
┌──────────────────────────────────────────────┐
│  [CLASS]                        Every Friday  │
│                                               │
│  Tafseer of Surah Al-Kahf                    │
│  Lakemba Mosque                (terracotta)   │
│                                               │
│  🕐 After Isha (~8:15 PM)  💬 English  👤 Mixed │
│  ─────────────────────────────────────────── │
│  Speaker: Sheikh Ahmad Abdo                   │
└──────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Border | `1px solid #E4DDD2` |
| Border radius | 12px |
| Padding | 18–20px |
| Hover | border `#1E5248`, shadow `0 4px 20px rgba(30,82,72,0.08)` |
| Title | 16–17px, weight 700, Charcoal |
| Mosque name | 13px, weight 600, Terracotta (`#C4704B`) |
| Metadata row | 12–13px, weight 500, Warm Gray, inline SVG icons |
| Speaker section | Below `1px solid #E4DDD2` divider, 12px font, Stone label, Charcoal name |

### Event Type Tags

| Type | Background | Text Colour |
|------|-----------|-------------|
| Talk | `rgba(30, 82, 72, 0.08)` | `#1E5248` (Teal) |
| Class | `rgba(90, 122, 110, 0.09)` | `#5A7A6E` (Deep Sage) |
| Quran Circle | `rgba(196, 154, 60, 0.10)` | `#C49A3C` (Gold) |
| Iftar | `rgba(196, 112, 75, 0.09)` | `#C4704B` (Terracotta) |
| Sisters Circle | `rgba(122, 168, 154, 0.12)` | `#5A8A7A` (Dark Sea Sage) |
| Youth | `rgba(107, 140, 206, 0.12)` | `#4A6BA8` (Blue) |
| Taraweeh | `rgba(30, 82, 72, 0.08)` | `#1E5248` (Teal) |
| Charity | `rgba(196, 154, 60, 0.10)` | `#C49A3C` (Gold) |

Style: `font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 3px 10px; border-radius: 6px;`

### Filter Pills

| State | Background | Border | Text |
|-------|-----------|--------|------|
| Inactive | transparent | `1px solid #E4DDD2` | `#6B6560` (Warm Gray) |
| Active | `#1E5248` (Teal) | none | White |
| Hover (inactive) | `rgba(30, 82, 72, 0.04)` | `1px solid #9C9590` | Charcoal |

Style: `font-size: 12px; font-weight: 500; padding: 5px 14px; border-radius: 20px;`

### Buttons

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| Primary | `#1E5248` | White | None | Main CTAs: Browse Events, Subscribe |
| Primary hover | `#26695D` | White | None | |
| Secondary | `#C4704B` | White | None | Submit Event, warm accent actions |
| Secondary hover | `#D4896A` | White | None | |
| Outline | `#FFFFFF` | Charcoal | `1px solid #E4DDD2` | Tertiary: View Events |
| Outline hover | `#FFFFFF` | Teal | `1px solid #1E5248` | |
| Ghost | `rgba(30, 82, 72, 0.06)` | Teal | None | Low-emphasis actions |
| WhatsApp | `#FFFFFF` | `#25D366` | `1px solid #E4DDD2` | Share (with WhatsApp icon) |

Style: `font-size: 14px; font-weight: 600; padding: 10px 22px; border-radius: 10px;`

### Stale / Archived Event State

| Property | Value |
|----------|-------|
| Border | `1px dashed #E4DDD2` |
| Opacity | 0.6 on entire card |
| Tag colour | Stone (`#9C9590`) |
| Warning text | `#C4704B` (Terracotta), 11px: "⚠ May no longer be running" |

### Hero Section

| Property | Value |
|----------|-------|
| Background | `#1E5248` (Primary Teal) |
| Border radius | 14–16px |
| Padding | 36–48px |
| Pattern | Overlapping circles SVG, white, opacity 0.07 |
| "Halaqas" | 30–36px, weight 800, white |
| "حلقات" | 24–28px, weight 300, Sea Sage (`#7AA89A`) |
| Subtitle | 15–18px, weight 400, `rgba(255,255,255,0.85)` |
| Primary CTA | Terracotta button |
| Secondary CTA | White outline ghost button |

---

## Icons

Inline SVG, stroke-based, 2px stroke width, `currentColor`.

| Icon | Usage | Size |
|------|-------|------|
| Clock | Event time | 12–14px |
| Speech bubble | Language | 12–14px |
| Person | Gender | 12–14px |
| Refresh arrows | Recurring | 11–12px |
| Map pin | Location | 14–16px |
| Calendar | Subscribe | 14–16px |
| Share arrow | WhatsApp share | 16–18px |
| Warning triangle | Stale event | 12px |
| Upload arrow | Image submission | 16–18px |
| Check circle | Confirmation | 16–18px |
| X / close | Dismiss | 14px |
| Search | Search bar | 16px |

---

## Responsive Breakpoints

| Breakpoint | Width | Tailwind | Layout |
|-----------|-------|----------|--------|
| Mobile (default) | < 640px | default | Single column, full-width cards, stacked/scrolling filters |
| Tablet | 640–1024px | `sm:` / `md:` | Two-column card grid, horizontal filter row |
| Desktop | > 1024px | `lg:` | Max-width 900px centred container |

### Mobile Rules

- Minimum tap target: 44×44px
- No hover-only interactions
- Filter pills horizontally scrollable on overflow
- Cards full-width within page padding
- Bottom safe area padding for iOS PWA mode

---

## Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E5248',
          light: '#26695D',
          dark: '#153D36',
        },
        secondary: {
          DEFAULT: '#C4704B',
          light: '#D4896A',
          dark: '#A85A38',
        },
        sand: {
          DEFAULT: '#F2EEE6',
          dark: '#E4DDD2',
        },
        cream: '#FDFBF7',
        stone: '#9C9590',
        'warm-gray': '#6B6560',
        charcoal: '#2C2825',
        sage: {
          DEFAULT: '#7AA89A',
          deep: '#5A7A6E',
        },
        gold: '#C49A3C',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'button': '10px',
        'tag': '6px',
        'pill': '20px',
      },
      boxShadow: {
        'card-hover': '0 4px 20px rgba(30, 82, 72, 0.08)',
        'modal': '0 8px 32px rgba(44, 40, 37, 0.12)',
        'dropdown': '0 4px 16px rgba(44, 40, 37, 0.08)',
      },
    },
  },
};
```

---

## CSS Variables

```css
:root {
  --color-primary: #1E5248;
  --color-primary-light: #26695D;
  --color-primary-dark: #153D36;
  --color-secondary: #C4704B;
  --color-secondary-light: #D4896A;
  --color-secondary-dark: #A85A38;
  --color-cream: #FDFBF7;
  --color-sand: #F2EEE6;
  --color-border: #E4DDD2;
  --color-text-light: #9C9590;
  --color-text-mid: #6B6560;
  --color-text-dark: #2C2825;
  --color-sage: #7AA89A;
  --color-sage-deep: #5A7A6E;
  --color-gold: #C49A3C;
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
}
```

---

## Open Graph / Social Sharing

| Property | Value |
|----------|-------|
| `og:title` | "Halaqas — [Event Title]" or "Halaqas — Mosque Events in Sydney" |
| `og:description` | Event: "[Title] at [Mosque] — [Date] [Time]" |
| `og:image` | Generated card or source flyer (min 1200×630px) |
| OG card background | `#1E5248` (Primary Teal) |
| OG card text | White + Sea Sage for Arabic |

---

## Accessibility

| Combination | Contrast Ratio | WCAG AA |
|-------------|---------------|---------|
| Teal on White | 7.8:1 | ✅ Pass |
| Terracotta on White | 3.6:1 | ⚠️ Large/bold text only |
| Charcoal on Cream | 13.2:1 | ✅ Pass |
| Warm Gray on Cream | 4.7:1 | ✅ Pass |
| White on Teal | 7.8:1 | ✅ Pass |
| Stone on Cream | 3.1:1 | ⚠️ Large text only |

- Focus states: `outline: 2px solid #1E5248; outline-offset: 2px`
- All icons accompanied by text labels
- Form inputs have visible labels, not just placeholders
- Terracotta text only used at 13px+ with font-weight 600+
