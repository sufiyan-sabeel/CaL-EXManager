# CAL-EXMANAGER — design.md

**Personal Digital Command Center — Design System & UI Specification**

This document is the second of two planned deliverables (PRD.md + design.md). Only **design.md** was requested for this pass — PRD.md is not included here. This file is written for two audiences at once: a human reviewing product direction, and an AI implementation agent (OpenCode, using Stitch via MCP) that will generate and build real screens from it. Every section makes a specific decision. Where a capability depends on hardware/OS access a browser cannot provide, it is labeled **REQUIRES ANDROID COMPANION**. Where a capability is intentionally deferred, it is labeled **FUTURE INTEGRATION**.

---

## Table of Contents

1. Design Philosophy · 2. Reference Analysis · 3. Brand Direction · 4. Visual Language · 5. Color System · 6. Typography · 7. Spacing · 8. Grid · 9. Responsive Breakpoints · 10. Navigation · 11. Dashboard Layout · 12. Card System · 13. Buttons · 14. Inputs · 15. Charts · 16. Tables · 17. Lists · 18. Modals · 19. Drawers · 20. Bottom Sheets · 21. Toasts · 22. AI Interface · 23. Automation Builder · 24. Calendar · 25. Expense UI (CAL-EXPENSES) · 26. App Usage UI · 27. Performance UI · 28. Notifications UI · 29. Insights UI · 30. Privacy UI · 31. Mobile UI · 32. Desktop UI · 33. Interaction Design · 34. Motion · 35. Accessibility · 36. Loading States · 37. Empty States · 38. Error States · 39. Permission States · 40. Stitch MCP Design Instructions · 41. OpenCode Implementation Handoff Notes

---

## 1. Design Philosophy

CAL-EXMANAGER is not a finance app with extra pages bolted on. It is a single instrument panel for a person's digital life, and it has to feel calm enough to open ten times a day. The philosophy translates the brief's adjectives (premium, intelligent, calm, technical, trustworthy, modern, data-driven, personal, high-end SaaS) into rules an implementer can actually check work against:

- **One focal point per screen.** Every screen has exactly one thing designed to be looked at first — a hero metric, a hero chart, or a hero action. Everything else is quieter than it. If two elements compete for attention, one of them is wrong.
- **Hierarchy through scale and weight, not color.** Color is reserved for meaning (status, brand, data series). It is not used to make something "pop" for its own sake.
- **Restraint over decoration.** No element exists unless it encodes information. No stock imagery, no illustration, no filler graphics. If a card would be empty without a decorative flourish, the card's content is the problem, not the missing flourish.
- **One consistent system, eleven modules.** Performance, Apps, Alarms, Notes, Calendar, CAL-EXPENSES, Notifications, Automations, AI, Insights, and Privacy must all look like rooms in the same building — same tokens, same card grammar, same iconography — never like eleven separately-designed products.
- **Honesty about data.** The UI never implies a browser can read live Android telemetry it cannot. Every metric that depends on the future Android companion is visually marked as such, even when the companion isn't connected yet, so the product never lies to the user about what it currently knows.
- **Motion explains, it doesn't perform.** Animation is reserved for moments that show what changed (a value updating, a sheet opening, an automation firing). It is not sprinkled on every hover as texture.

---

## 2. Reference Analysis

Three references were supplied. Each is analyzed for its underlying **pattern**, not its literal styling — CAL-EXMANAGER must not be mistaken for any of the three, and must not reproduce their brand names, wordmarks, or copy.

### Reference 1 — dark analytics dashboard ("Wise"-style)
**What it does:** a persistent dark sidebar with a profile block and a light/dark toggle pinned at the bottom; a top bar with page title, search, and a bright single-color "Upgrade" CTA; a 3×2 card grid that is deliberately *uneven* — one flat saturated-yellow card, one textured dark card, one high-contrast near-white card, two standard dark metric cards, and one editorial photo card.
**Pattern worth keeping:** exactly **one** card per screen gets the strongest visual weight (the accent-filled card), everything else recedes; a light/white card is used once as a contrast beat, not as a theme; a circular progress ring carries the hero metric.
**What we reject outright:** the flat saturated single-hue fill as our "hero" treatment (too close to a literal copy, and it's the generic SaaS-card-kit move); the editorial stock-photo card (no photography anywhere in CAL-EXMANAGER); yellow as an accent (see §5 — we need our own hue, and yellow collides with our warning color).

### Reference 2 — dark fintech dashboard ("ethereal"-style)
**What it does:** a centered pill-shaped tab switcher instead of a sidebar-only nav; a wide hero card with a soft two-tone gradient carrying the primary balance figure; paired income/expense cards with trend badges; a bar chart with a tooltip callout; a donut chart with a side legend; a scrolling transaction list with status badges; a dedicated right-hand context panel (fanned payment cards + subscriptions list) that is structurally separate from the analytics grid.
**Pattern worth keeping:** a **dedicated right-context panel** on desktop for "supporting" content that isn't core analytics (we reuse this idea for calendar day detail / AI quick panel, see §32); count badges next to section titles ("My cards 3", "Subscriptions 5"); a consistent "see all / manage" affordance at the top-right of list sections; donut + side legend as the standard category-breakdown pattern.
**What we reject outright:** the mint-lime gradient hero fill (not our palette, and full-saturation gradient hero fills read as generic fintech); the whole dashboard framed as a floating card on a light lavender backdrop (CAL-EXMANAGER's canvas *is* the dark surface — no outer frame device); stacked fanned card-art illustration (no illustrative card art in our product).

### Reference 3 — contribution/activity heatmap
**What it does:** a fixed-size cell grid, 7 rows by weeks-of-columns, muted empty-cell gray, a 4–5 step single-hue intensity scale, month labels above, a simple "Less → More" legend.
**Pattern worth keeping:** this is the single best pattern in the brief for two screens — **Insights** (composite daily activity) and **CAL-EXPENSES** (daily spend intensity). We adopt the grid mechanic exactly (fixed cell size, muted empty state, intensity legend) but drive it from our own data and our own accent hue instead of green.
**What we reject outright:** using green specifically (green is reserved for `success` in our status system, see §5) — our heatmap uses the primary accent scale instead, so it never gets confused with a "positive/negative" status signal.

### Explicit non-negotiables carried from all three
No product names, logos, or copy from Wise, ethereal, or any GitHub-style product appear anywhere in CAL-EXMANAGER. No literal color values are reused. The synthesis below is an original system.

---

## 3. Brand Direction

**Primary brand name (everywhere in the UI, always):** `CAL-EXMANAGER`
**Positioning line:** *Personal Digital Command Center.*
**Module name:** `CAL-EXPENSES` — used only as the label of the finance module (nav item, module header, module-scoped breadcrumbs). It is never the app's title, browser tab title, login screen title, or marketing name.

**Banned brand variants** (never render these anywhere, including empty states, emails, or error copy): `Cal Expenses`, `CalExpenses`, `CAL Expenses Manager`, `CAL-Expense Manager`, or any casing/spacing variant other than the two forms above.

**Voice:** plain, direct, sentence case, active voice. Buttons say what happens ("Save automation," "Connect device," "Export report") — never vague verbs like "Submit" or "Continue" where a specific verb is available. Empty and error states speak in the product's voice, not an apologetic human voice — they state what's missing and what to do next, nothing more.

**Wordmark:** text-set, not an illustrated logo, for MVP. Set `CAL-EX` in the primary typeface at `h1` weight (700) and `MANAGER` at the same size in a lighter weight (500) immediately after it, no space, so the two halves of the name read as one deliberate unit rather than a slogan. No icon mark is required for MVP; if a mark is added later it should be an abstract geometric node/signal glyph — never a literal phone, wallet, or calendar icon (those are already taken by the module icons).

**Tagline usage:** "Personal Digital Command Center" appears once, under the wordmark on the login/marketing surface and in the browser tab meta description. It does not repeat inside the authenticated app.

---

## 4. Visual Language

- **Dark-first, always-on canvas.** The dashboard is not a card floating on a lighter backdrop (rejecting Reference 2's framing device) — the dark surface *is* the product's skin, edge to edge.
- **Restrained gradients.** A soft directional glow (accent color fading to transparent, ≤12% opacity) is permitted on exactly one hero element per screen. No gradients on standard cards, buttons, or backgrounds elsewhere.
- **No drop shadows on resting UI.** Static dashboard cards are separated from the canvas by a 1px hairline border and a one-step surface tone shift — not a shadow. Shadows are reserved for UI that is temporarily *above* the canvas: menus, popovers, modals, drawers, sheets, toasts (see §12 for the reasoning — this is a deliberate departure from all three references, which shadow every card).
- **Numeric-forward hierarchy.** The biggest, boldest element on any screen is almost always a number (a metric, a balance, a score), set in tabular figures so digits never jitter as they update.
- **Iconography.** Lucide-style line icons only, 1.75px stroke, no fills except tiny 6–8px solid status dots. One icon system throughout — never mix a filled icon set into a line-icon screen.
- **No photography, no illustration.** Every visual on screen is either typography, an icon, or a data visualization. This is a deliberate rule, not an oversight — it's what keeps eleven modules feeling like one calm system instead of a marketing site.
- **No decorative eyebrows.** Headings are not preceded by a small tracked-uppercase label ("OVERVIEW," "STATISTICS") purely for texture. A label appears above content only when it disambiguates something genuinely ambiguous.
- **Uppercase is reserved for badges only** (status chips, count badges) — never used as a default treatment for section labels, chart axis labels, or captions, which are set in normal sentence case.
- **No trailing arrow glyphs on links/buttons.** "See all," "Manage," "Details" stand on their own. If a direction needs signaling, use a proper chevron icon component, not a `→` character appended to text.

---

## 5. Color System

Dark mode is the primary and only mode at MVP. All values are design tokens — implementers reference the token name, not the hex, so the palette can be retuned centrally.

### 5.1 Surfaces & borders

| Token | Value | Use |
|---|---|---|
| `surface-base` | `#0A0B0E` | Outermost app shell background |
| `surface-canvas` | `#101218` | Dashboard/content canvas (one step up from base, separates chrome from content) |
| `surface-1` | `#15171F` | Default resting card surface |
| `surface-2` | `#1C1F29` | Elevated card / active list row / input fill |
| `surface-3` | `#20232E` | Modal, drawer, sheet, popover background |
| `surface-inverse` | `#F4F5F7` | High-contrast "beat" card, used once per dense screen at most (mirrors Reference 1's white card, never as a default card style) |
| `border-subtle` | `#21242C` | Hairline dividers inside a card |
| `border-default` | `#2B2F3A` | Card outlines, input borders |
| `border-strong` | `#3D4250` | Focus-adjacent, active tab underline |

### 5.2 Text

| Token | Value | Use |
|---|---|---|
| `text-primary` | `#F5F6F8` | Headings, metric numerals, primary body |
| `text-secondary` | `#A6ACBB` | Supporting body, card descriptions |
| `text-tertiary` | `#6B7180` | Timestamps, placeholder, disabled labels |
| `text-disabled` | `#454A56` | Disabled control text |
| `text-inverse` | `#12131A` | Text on `surface-inverse` and on filled accent buttons |

### 5.3 Brand accent — "Signal"

The brief asks for an accent that is "distinctive... but ORIGINAL to CAL-EXMANAGER," not yellow (Reference 1) and not green-lime (Reference 2). We ground the choice in the product's own subject matter rather than a generic SaaS default: a *command center* reads its world through status lights and signal indicators in a dark room — that vernacular is where this hue comes from.

| Token | Value | Use |
|---|---|---|
| `accent-signal` | `#5B6EF5` | Primary CTA, active nav state, focus ring, AI surfaces, hero glow |
| `accent-signal-strong` | `#4453D6` | Hover/pressed state of filled accent elements |
| `accent-signal-subtle` | `rgba(91,110,245,0.14)` | Tinted backgrounds: active nav pill, selected chip, hero glow wash |
| `data-teal` | `#22B8B0` | Secondary chart series only — never used for interactive elements, so it never gets confused with the brand accent |

`accent-signal` is deliberately more violet-leaning than `info` below, so the brand color and the "informational" status color never read as the same thing on a dense screen.

### 5.4 Status (fixed semantics — never repurposed for anything else)

| Token | Value | Subtle bg | Use |
|---|---|---|---|
| `success` | `#22C55E` | `rgba(34,197,94,0.14)` | Positive trend, income, automation succeeded, connected |
| `warning` | `#F0A83A` | `rgba(240,168,58,0.14)` | Budget nearing limit, battery low, permission partially granted |
| `error` | `#EF5164` | `rgba(239,81,100,0.14)` | Over budget, expense, automation failed, disconnected |
| `info` | `#4C8DF6` | `rgba(76,141,246,0.14)` | Neutral system notices, informational banners |

### 5.5 Chart categorical palette

Used for multi-series breakdowns (expense categories, app categories) where color communicates *identity*, not status — so it is intentionally a distinct set from §5.4:

`chart-1 #5B6EF5` (=accent-signal) · `chart-2 #22B8B0` · `chart-3 #E8698C` · `chart-4 #D9B26D` · `chart-5 #5AA9E6` · `chart-6 #7FAE8C`

Never assign more than 6 categories a distinct color in one chart — beyond 6, group the remainder into an "Other" slice.

### 5.6 Activity/intensity scale (heatmaps — CAL-EXPENSES calendar, Insights activity grid)

Five steps on the accent hue, empty cell first: `heat-0 (empty) #1A1D26` · `heat-1 rgba(91,110,245,0.18)` · `heat-2 rgba(91,110,245,0.38)` · `heat-3 rgba(91,110,245,0.62)` · `heat-4 #5B6EF5`. This reproduces Reference 3's *mechanic* (muted empty cell, ascending single-hue intensity, 5 steps) on our own hue instead of green, so it is never misread as a success/failure signal.

### 5.7 Light theme — **FUTURE INTEGRATION**

Dark is the only shipped theme at MVP. When a light theme is built, it must reuse the same token *names* with inverted values (surfaces move light-to-dark instead of dark-to-light, `accent-signal` hue stays constant, all contrast ratios re-verified against §35) — never a separate token set, so components never need to know which theme is active.

---

## 6. Typography

**Primary typeface: Plus Jakarta Sans** (weights 400/500/600/700/800), system-ui fallback stack for load resilience.

**Why this one, not Inter or Manrope:** the brief allows any of the three. Inter and Manrope are the two most common choices in dashboards of this exact kind today, which risks CAL-EXMANAGER reading as one more generic SaaS instance the moment it's opened. Plus Jakarta Sans keeps the geometric confidence a data-dense product needs at display sizes (the hero balance, the Command Score) while carrying slightly more warmth in its letterforms than Inter's clinical neutrality or Manrope's stricter geometry — which matters because this product is explicitly meant to feel *personal*, not just technical. It also has full tabular-figure support, which every metric-driven screen in this spec depends on.

**Numerals:** `font-variant-numeric: tabular-nums` is applied globally to any element displaying a metric, currency value, percentage, or timestamp, so values never reflow horizontally when they update.

### Type scale

| Token | Size/Line | Weight | Use |
|---|---|---|---|
| `metric-hero` | 44/52 | 800 | The single largest number on a screen (balance, Command Score) |
| `metric-lg` | 32/40 | 700 | Secondary metric numerals (card headline figures) |
| `h1` | 26/34 | 700 | Page title |
| `h2` | 20/28 | 700 | Section heading |
| `h3` | 16/24 | 600 | Card title |
| `body-lg` | 15/22 | 400–500 | Primary reading text, list titles |
| `body-md` | 14/20 | 400–500 | Secondary body, table cells |
| `body-sm` | 13/18 | 500 | Meta text, timestamps, helper text |
| `label` | 12/16 | 600 | Form labels, axis labels, filter chips — **sentence case**, not uppercase |
| `micro-badge` | 11/14 | 700 | Status/count badges only — uppercase, +0.02em tracking |

**Line length:** body text columns cap at ~72 characters (AI chat responses, note bodies, insight card copy). Dashboard labels and metrics are not prose and are exempt.

---

## 7. Spacing

4px base unit.

| Token | Value | Typical use |
|---|---|---|
| `space-1` | 4px | Icon-to-label gap |
| `space-2` | 8px | Tight inline gaps, chip padding |
| `space-3` | 12px | List row internal padding (mobile) |
| `space-4` | 16px | Card padding (mobile), input padding |
| `space-5` | 20px | Card gap (mobile), card padding (tablet) |
| `space-6` | 24px | Card padding (desktop), card gap (desktop) |
| `space-7` | 32px | Section gap (mobile) |
| `space-8` | 40px | Canvas margin (desktop), section gap (desktop) |
| `space-9` | 48px | Page-top spacing under top bar |
| `space-10` | 64px | Major layout separations (rare) |

---

## 8. Grid

**Desktop (≥1024px):** 12-column grid, 24px gutter, canvas padding 40px, content max-width 1440px (centered beyond that). Sidebar occupies a fixed 264px rail outside the grid (72px when collapsed).

Standard card spans on the 12-col grid: hero card `8 cols`, paired secondary metric `4 cols` (stacks two to match hero height), standard `MetricCard` `3 cols` (four across a row), `ChartCard`/`ActivityCard` `6–8 cols`, right-context panel (desktop only, see §32) fixed `320px` outside the 12-col grid.

**Tablet (640–1023px):** 8-column grid, 20px gutter, canvas padding 24px. Hero spans `8 cols` (full width), metric cards `4 cols` (two across), chart cards `8 cols` (full width, stacked).

**Mobile (<640px):** 4-column grid, 16px gutter, canvas padding 16px. Nothing spans partial width by default — cards are full-bleed within the canvas padding — except horizontally-scrolling metric rows (see §31), which break the grid intentionally.

---

## 9. Responsive Breakpoints

| Name | Range | Nav mode | Layout mode |
|---|---|---|---|
| Mobile | 0–639px | Bottom nav + top bar | Single column, horizontal-scroll metric groups |
| Tablet | 640–1023px | Collapsed icon-rail sidebar | 8-col grid, secondary panels drop |
| Desktop | 1024–1439px | Full sidebar | 12-col grid + optional right context panel |
| Wide | 1440px+ | Full sidebar | Same as desktop, content capped at 1440px, extra space becomes canvas margin |

---

## 10. Navigation

### Desktop sidebar (persistent, 264px)
Top-to-bottom: wordmark (§3) · global search / Cmd+K trigger · primary module list (Dashboard, Performance, Apps, Alarms, Notes, Calendar, CAL-EXPENSES, Notifications, Automations, AI, Insights) as icon+label rows, active item gets `accent-signal-subtle` pill background and `accent-signal` icon/text · divider · secondary items (Privacy, Settings) · bottom-pinned: profile row (avatar, name, "Edit") and a collapse toggle. No theme toggle at MVP (dark-only, §5.7).

### Tablet icon rail (72px, collapsible)
Same order, icons only; label appears in a flyout tooltip on hover/focus. A single tap/click expands back to the full 264px sidebar as an overlay, not a permanent width change (keeps content width stable).

### Mobile (top bar + bottom nav)
**Top bar (56px):** left — avatar + short greeting ("Hi, Asha"); right — search icon, notification bell (with unread dot). No page title duplicated here; the page title lives in the canvas below.

**Bottom nav (5 slots, 64px):** `Home` · `CAL-EXPENSES` · a raised center **Quick Add** button (56px circular, `accent-signal` fill, elevation `shadow-e2`, opens the bottom-sheet action picker: Add expense / Create alarm / New note / New event) · `AI` · `More`.

**"More" sheet:** a full-height bottom sheet (§20) listing the remaining eight modules (Performance, Apps, Alarms, Notes, Calendar, Notifications, Automations, Insights, Privacy) as a 2-column icon+label grid — this is the deliberate solution to eleven modules not fitting in a 5-slot bottom nav, without demoting any module to a buried hamburger menu.

### Keyboard shortcuts (desktop)
`Cmd/Ctrl+K` — global search & AI command bar. `G` then a letter — jump navigation: `G D` Dashboard, `G E` CAL-EXPENSES, `G A` Automations, `G I` Insights, `G N` Notes, `G C` Calendar.

---

## 11. Dashboard Layout

**Desktop composition, top to bottom:**
1. Top bar — greeting + date/time, global search/command bar, notification bell, profile menu, upgrade CTA (if the account is on a free tier).
2. **Primary row** — one hero card (`Command Score`, an 8-col composite device+digital wellbeing ring, see §12) beside a stacked pair of 4-col cards (`Today's Expenses`, `Upcoming Events`).
3. **Secondary row** — `Battery` / `Storage` / `Screen Time` / `App Usage` as four 3-col `MetricCard`s.
4. **Analytics row** — `Activity Heatmap` (6-col) and `Expense Trend` chart (6-col).
5. **Tertiary row** — `Calendar Timeline` (4-col), `Automation Status` (4-col), `AI Insight` card (4-col).
6. **Recent activity** — full-width `ListCard` (recent transactions, notes, automation runs, interleaved and timestamped).

**Widget catalog note:** the modules above are the MVP default order. Drag-to-reorder / hide-widget customization is **FUTURE INTEGRATION** (Phase 2 per PRD) — the layout engine should still be built so widgets are independent, reorderable units even though the reordering UI ships later.

---

## 12. Card System

**Why static dashboard cards carry no drop shadow (departing from all three references):** a shadow under every card is the single most common "generic AI dashboard" tell, and with eleven modules' worth of cards on screen across a session, a shadow on all of them would also be visually loud rather than calm. Instead, resting cards are separated from the canvas by a 1px `border-default` and a one-step surface shift (`surface-1` on `surface-canvas`). Shadows (`shadow-e1`–`e4`, §4) are reserved for UI that is *temporarily* above the canvas — menus, modals, drawers, sheets, toasts — so a shadow always means "this will go away," never "this is a card."

**Hover is reserved for actionable elements.** A card with no click target (most `MetricCard`s) has no hover state at all — motion never implies interactivity that isn't there. Cards that open a drawer/detail view (app rows, automation cards, note cards) get a 150ms border-color shift to `border-strong` on hover — no lift, no shadow bloom.

**Radius varies by hierarchy**, not one value everywhere: hero/feature cards `radius-lg (20px)`, standard cards `radius-md (14px)`, list/table rows `radius-sm (10px)` or square with dividers, badges/avatars `radius-full`.

Twelve reusable card types:

| Card | Purpose | Header | Body | Footer |
|---|---|---|---|---|
| **MetricCard** | One number + trend | Icon + label | `metric-lg` value, trend arrow+% in status color | none |
| **TrendCard** | Number + sparkline | Label + period selector | Value, inline sparkline | Comparison text ("vs last week") |
| **ChartCard** | Larger data viz | Title + view toggle (e.g., Weekly/Monthly) | Chart canvas | Legend |
| **ActivityCard** | Heatmap/timeline | Title + date range | Grid or timeline viz | Intensity legend |
| **InsightCard** | AI-generated summary | "AI" tag icon + label | 1–3 sentence generated text | "Ask a follow-up" link into AI (§22) |
| **StatusCard** | Connection/health state | Icon + label | Status text + colored dot | Action button (Connect / Manage) |
| **ListCard** | Scrollable row list | Title + count badge + "See all" | Up to 5 `ListRow`s (§17) | "See all" repeated if list is long |
| **CalendarCard** | Mini month/week view | Month label + nav arrows | Date grid with event dots | "Open calendar" |
| **ExpenseCard** | Spend figure | Category icon + name | Amount, budget progress bar | Over/under budget label |
| **AppUsageCard** | Per-app usage row | App icon + name | Time value, mini sparkline | Category tag |
| **AutomationCard** | One automation | Enabled toggle + name | WHEN → THEN summary line | Last run status + timestamp |
| **DeviceHealthCard** | Composite health ring | "Device Health" label | Progress ring + score number | Contributing factors list |

**Shared states across every card type:** *Loading* — skeleton shape matching final layout (§36). *Empty* — icon + one-line message + optional action (§37). *Error* — icon + "Couldn't load [X]" + Retry button, replacing body content only, header stays intact (§38). *Mobile* — full-bleed width, `space-4` padding instead of `space-6`, chart cards drop non-essential gridlines/axis ticks.

---

## 13. Buttons

| Variant | Fill | Use |
|---|---|---|
| Primary | `accent-signal` fill, `text-inverse` label | One per screen/section, the single most important action |
| Secondary | `border-default` outline, `text-primary` label, transparent fill | Supporting actions |
| Tertiary/Ghost | No border, `text-secondary` label | Low-emphasis actions ("Cancel," inline links) |
| Destructive | `error` outline or fill (fill only inside confirmation modals) | Delete, disconnect, revoke |
| Icon-only | 40×40 tap target, `surface-2` fill on hover | Toolbar actions |

**Sizes:** `sm` 32px height (dense toolbars) · `md` 40px height (default) · `lg` 48px height (primary mobile CTAs, sheet footers).

**States:** default, hover (`accent-signal-strong` for primary; `surface-2` bg for secondary/ghost), active/pressed (2% darker + scale 0.98 for 80ms), focus (2px `accent-signal` ring, 2px offset — never suppressed), disabled (`text-disabled` label, `border-subtle` outline, no hover response), loading (label replaced by a 16px spinner, button width does not change).

**Rule:** never more than one Primary button visible in the same view at once.

---

## 14. Inputs

Standard controls: text field, search/command field, select, date picker, toggle switch, checkbox, radio, segmented control (view toggles: Day/Week/Month, Weekly/Monthly), slider (budget threshold setting), tag/chip input (note tags, automation labels).

**Sizing:** 40px height default, 48px for mobile-optimized entry flows (Add Expense, Create Alarm). Radius `radius-sm (10px)`. Fill `surface-2`, border `border-default`.

**States:** default → focus (`border-strong` + 2px `accent-signal` outer ring) → filled (border returns to `border-default`, value in `text-primary`) → error (`error` border + helper text in `error` below the field, icon inside the field) → disabled (`surface-1` fill, `text-disabled` value, no border).

**Segmented control** (Day/Week/Month, etc.): pill-shaped track, `radius-full` — the one place a full pill is correct, since it's a single small control, not a whole card. Active segment gets `surface-2` fill; inactive segments are transparent.

---

## 15. Charts

| Type | Use |
|---|---|
| Line | Continuous trend over time (expense trend, screen-time trend) |
| Area | Same as line, with volume emphasis (cumulative spend) |
| Bar | Discrete period comparison (weekly totals, notification counts by app) |
| Donut | Category breakdown (expense categories, app categories) |
| Progress ring | Single composite score (Command Score, budget-used %) |
| Heatmap | Daily intensity over weeks/months (CAL-EXPENSES calendar, Insights activity) |
| Sparkline | Inline micro-trend inside a `TrendCard`/`AppUsageCard` |
| Timeline | Chronological event sequence (Calendar day view, automation run history) |

**Rules:** no more than 6 series/categories with distinct color before folding the remainder into "Other" (§5.5). No 3D effects, no drop shadows on chart elements, gridlines at `border-subtle` only, axis labels in `label` style (sentence case). Every status-colored data point also carries a non-color cue (icon, pattern, or direct label) so meaning never depends on color alone (§35). **Mobile:** gridlines and axis ticks are reduced or dropped; hover-tooltips become tap-to-reveal; charts scale to full canvas width.

---

## 16. Tables

Used for dense lists: transaction history, app list, automation run history. Hairline row dividers (`border-subtle`), **no zebra striping** (keeps the calm, quiet surface). Header row: `label` style, sticky on scroll. Row height 48px desktop / 56px mobile-as-list. Row hover: `surface-2` background only (no border/shadow change). Sort indicator: small chevron next to the active column header, no full-column highlight. **Mobile transformation:** tables become stacked `ListRow`s (§17) — a literal HTML/grid table is never rendered on mobile.

---

## 17. Lists

One `ListRow` component reused everywhere (transactions, notifications, notes, alarms, app rows): leading icon or avatar (24–32px) → title (`body-lg`) + subtitle (`body-sm`, `text-secondary`) → trailing value/meta (right-aligned, `body-md`, tabular numerals) + optional status badge. Divider `border-subtle` between rows, no divider after the last row in a card. Mobile: swipe-left reveals contextual actions (archive/delete) on Notes and Notifications rows only; other lists are tap-only.

---

## 18. Modals

Sizes: `sm` 400px (confirmations), `md` 560px (short forms), `lg` 720px (multi-field forms, desktop-only automation editing). Structure: header (title + close icon, top-right) → scrollable body → footer (actions right-aligned, Primary button rightmost, Secondary/Cancel to its left). Backdrop: `surface-base` at 70% opacity, no blur (blur reads as decorative glassmorphism, which the brief explicitly asks us to avoid). Elevation `shadow-e3`. Focus trapped inside while open; closing returns focus to the triggering element.

---

## 19. Drawers

Right-side panel, desktop/tablet only, width 420px, elevation `shadow-e3`. **Use case distinction from Modal:** a drawer is for *inspecting or editing an existing item* without losing the dashboard behind it (app detail, automation detail, transaction detail) — the canvas stays visible and dimmed at 40%. A modal is for a *focused single task* (confirmation, short create form) that fully blocks the canvas. Drawer close: click outside, `Esc`, or explicit close icon.

---

## 20. Bottom Sheets

Mobile's equivalent of both modal and drawer. Snap points: **peek** (just a title + primary action, ~25% height), **half** (~55% height, default for most flows), **full** (95% height, for multi-step flows like the Automation Builder's step editor). Drag handle (4px bar, `border-strong`) centered at top. Elevation `shadow-e4`. Use cases: Add Expense, Create Alarm, Automation step editor, and the "More" navigation sheet (§10).

---

## 21. Toasts

Position: top-right on desktop, top-center (below the status bar/top bar) on mobile. Variants map directly to §5.4 status tokens, each with a matching icon (never color alone). Auto-dismiss after 4s (success/info) or persist until dismissed (error, until the user acknowledges). Max 3 stacked at once — a 4th queues. Example: automation execution feedback toast — `success` icon + "Morning routine ran — 3 actions completed."

---

## 22. AI Interface

Three surfaces, one voice:

1. **Global command bar** (`Cmd/Ctrl+K` desktop, search icon mobile) — typing a natural-language request (see PRD for full example set) either navigates, executes an action after a one-line confirmation ("Create expense — ₹250 · Food — Add?"), or hands off to the full AI page for anything requiring more than one turn.
2. **Dedicated AI page** — a conversation thread (bubbles: user right-aligned `surface-2`, assistant left-aligned `surface-1` with a small `accent-signal` AI mark), a streaming-response indicator (three-dot pulse, not a spinner), suggested-prompt chips above the input when the thread is empty, and inline **insight cards** (reuses `InsightCard` from §12) rendered directly in the thread when the answer is data-shaped (a chart, a metric) rather than just prose.
3. **Contextual actions** — an "Ask AI" ghost button on `ChartCard`/`InsightCard` headers that opens the AI page pre-seeded with a question about that specific card's data.

**Data provenance:** any AI answer that draws on module data shows a plain-sentence source note under the response (e.g., "Based on CAL-EXPENSES data from Aug 1 to Aug 31") — not a dot-joined metadata string, a normal sentence, so it's legible and unambiguous.

**Security note carried into the interface spec:** there is no field anywhere in the UI for entering an AI/API key — all AI calls are proxied server-side (full requirement in PRD, §18/§Security).

---

## 23. Automation Builder

**Decision: a linear vertical step builder, not a free-form node canvas.** A canvas-style builder cannot be made genuinely usable at 375px width, and the brief requires automations to stay usable on mobile — so CAL-EXMANAGER uses one consistent stepper on both breakpoints instead of two different paradigms.

**Structure, top to bottom:** enabled/disabled toggle + automation name (top of the card) → **WHEN** step (trigger, e.g. "Battery below 20%") → optional **IF** step(s), visually indented one level under WHEN → one or more **THEN** steps, shown as an ordered list of action chips → a `+` control to add another condition or action. Each step is its own compact card with a type icon, an editable one-line summary, and a trailing edit/remove control.

**Permission-aware steps:** any trigger/condition/action that needs the Android companion carries a small lock badge and, if the companion isn't connected, an inline warning row: "Battery trigger requires Android Companion — Connect device" (see §39).

**Run history tab:** a chronological `ListRow` timeline per automation — status dot (success/error), timestamp, one-line result. Failed runs expand in place to show the error (§38), no separate page.

**Templates:** a gallery of prebuilt automations as `ListCard` entries ("Low battery alert," "Morning routine," "Big-expense alert") with a single "Use template" action that opens the builder pre-filled and editable.

---

## 24. Calendar

Segmented control: `Day / Week / Month`. **Month view:** date grid, each cell shows small colored event dots (not full event text) — dot color maps to source module (CAL-EXPENSES = `accent-signal`, Notes = `data-teal`, Alarms = `chart-4`, Automations = `chart-5`, manual events = `chart-3`), with a compact legend below the grid. **Week/Day view:** vertical timeline with a time-gutter on the left; Day view additionally lists all-day items (bills, birthdays) pinned above the timeline. **Creation:** `+` floating action (desktop: bottom-right button; mobile: opens the bottom sheet, §20) with a type picker (Event / Task / Reminder / Bill). Cross-module items (an expense due date, an alarm) appear as calendar chips using the same source-module color and icon as their home module, so the link back is always legible at a glance.

---

## 25. Expense UI (CAL-EXPENSES)

This module is the most mature existing surface and gets the fullest "elevated" treatment described in §2.

**Overview screen:** hero card — month-to-date total + trend vs last month (mirrors Reference 2's balance-card *pattern*, our own palette — no gradient fill, just the single permitted hero glow from §4). Paired `Income` / `Expense` MetricCards with trend badges. `Budget progress` ListCard — one row per category with a thin progress bar (`success` under budget, `warning` near limit, `error` over). `Category donut` (chart categorical palette, §5.5) with side legend. **Spend heatmap** — the CAL-EXMANAGER application of Reference 3's grid mechanic: one cell per day, intensity = amount spent that day, on the `heat-0..4` scale (§5.6). `Recurring expenses` ListCard. `Transaction history` table (§16). **Add Expense** flow: bottom sheet (mobile) / modal (desktop) — amount-first large numeric entry, category picker (icon grid), date, recurring toggle, optional note. **Export:** menu offering PDF or CSV, both generated server-side. **AI spending insight:** one `InsightCard` at the top of Insights-relevant views, e.g. "Spending increased 18% this month, mostly in Food" — always AI-labeled, never presented as a raw fact.

---

## 26. App Usage UI

**Overview:** Today's screen-time hero number + trend vs yesterday/7-day average. Category bar/donut breakdown. **App list** — `AppUsageCard` rows (icon, name, time, mini sparkline); tapping opens a drawer with a fuller usage chart, notification count, and a "distraction score." **Most Distracting Apps** — ranked `ListCard`.

**Data source note:** live per-app usage time, category attribution, and notification counts all require the Android companion and its Usage Access permission — **REQUIRES ANDROID COMPANION**. Until connected, this entire module shows the "Not Connected" permission state (§39: "Connect your Android device to see app usage"). As a web-only fallback that does *not* require the companion, users may manually log time against an app or category for their own tracking purposes — this manual entry is clearly labeled "Self-reported" wherever it's displayed, distinct from companion-sourced data, and ships as **FUTURE INTEGRATION** rather than MVP.

---

## 27. Performance UI

**Overview:** `DeviceHealthCard` hero ring (composite score). Battery / Storage / RAM / CPU / Network as `MetricCard`s. History timeline chart. Device health score trend.

**Data source notes, per metric:**
- Battery percentage/charging state/temperature — modern browsers have deprecated or heavily restricted the Battery Status API; treat as unavailable in-browser. **REQUIRES ANDROID COMPANION.**
- Storage — a browser can estimate *its own* site storage quota via the Storage API, which is not the same as device-wide free storage. Show that estimate only if explicitly labeled "App storage" and keep true device storage under **REQUIRES ANDROID COMPANION.**
- RAM, CPU, network throughput, device uptime — no standard browser API exposes these. **REQUIRES ANDROID COMPANION**, full stop.
- Screen time (aggregate) — **REQUIRES ANDROID COMPANION** (see §26).

Until the companion is connected, every card in this module renders the locked/partial permission state (§39), never a fabricated value.

---

## 28. Notifications UI

**Overview:** today's notification count hero, by-app bar list, hour-of-day activity chart, "most active apps" ranked list.

**Data source note:** a browser cannot read system notification content or history under any circumstance — this is not a permissions gap that gets closed by "trying harder," it requires the Android companion **and** the user explicitly granting Android's system-level Notification Access permission to that companion app. **REQUIRES ANDROID COMPANION.** The permission-required empty state must name this precisely rather than a generic "connect a device" message: "Notification analytics need Notification Access, granted to the CAL-EXMANAGER companion in your Android settings." (§39)

---

## 29. Insights UI

Composite cross-module analytics page. **Weekly digital activity** summary card. **Activity heatmap** — Reference 3's grid mechanic applied to a composite signal (notes created, expenses logged, automations run, and, once connected, screen time) rather than a single metric, so it stays meaningful even before the Android companion exists. Trend charts per connected module (expense trend always available; screen-time/app trends only once companion-connected). **AI-generated narrative insight cards** — always carry the small AI mark from §22 so generated text is never mistaken for a raw fact. **Empty state**, verbatim: *"No activity data yet."* — no fabricated statistics are ever shown in their place.

---

## 30. Privacy UI

A plain-language data-control center, not a legal document. Sections: **Data Permissions** (per-module toggles, default OFF for anything optional), **Connected Devices** (companion pairing status + one-tap revoke), **AI Processing Controls** (toggle + a one-paragraph plain explanation of what is sent to the AI and what isn't), **Export Data** (same PDF/CSV mechanism as §25), **Delete Data / Delete Account** (danger zone, requires typed confirmation in a modal, §18), **Local vs Cloud** indicator per module, **Integration Permissions** list, **Activity/audit log** (a `ListCard` of data-access events, mirroring the automation run-history pattern for consistency). Tone throughout: transparent, no dark patterns — nothing optional defaults to on.

---

## 31. Mobile UI

Applied summary (system rules live in §9/§10; this is how they render on an actual mobile screen):

- Top bar 56px + bottom nav 64px (§10) frame every screen; canvas scrolls between them.
- Metric-card rows that would be 4-across on desktop become a **horizontally-scrollable, snap-to-card row** on mobile — never a plain vertical stack of the same four cards, per the brief's explicit requirement that mobile stay "the same premium dashboard," not a shortened one.
- Detail views that are a Drawer on desktop become a full-screen Bottom Sheet on mobile (§20).
- Swipe-to-reveal actions on Notes/Notifications rows (§17).
- A sticky contextual action bar pins to the bottom of complex mobile flows (e.g., the Automation Builder's "Save automation" button stays visible while the step list scrolls above it).
- Touch targets minimum 44×44px throughout (larger than the 40×40 desktop default, §35).

---

## 32. Desktop UI

Applied summary: persistent 264px sidebar + fluid content column + an **optional right context panel** (fixed 320px, collapsible), reserved for content that supports the main view without belonging in the analytics grid — this is CAL-EXMANAGER's original use of Reference 2's "dedicated right panel" pattern: a selected Calendar day's detail, or a pinned AI quick-panel, rather than a static card-art display. Tables gain hover-revealed row actions (edit/delete icons fade in on row hover, §16) that don't exist on the mobile stacked-list version. Full keyboard shortcut support (§10).

---

## 33. Interaction Design

Minimum interactive target: 40×40px desktop, 44×44px mobile. Every hover-triggered affordance (row actions, tooltips) has a working touch/keyboard equivalent — nothing is hover-only. Reorderable elements (automation steps now; dashboard widgets, **FUTURE INTEGRATION**) use an explicit drag handle icon, never "grab the whole row." Right-click (desktop) / long-press (mobile) opens a context menu on list rows where relevant actions exist (rename, pin, archive, delete) — always a secondary path, never the only way to reach an action.

---

## 34. Motion

**Durations:** `fast 120ms` (toggle, checkbox) · `base 200ms` (menu open, sidebar collapse, actionable-card border shift) · `slow 320ms` (modal/sheet/drawer transition, page-level change).

**Easing:** standard ease-out for anything entering, ease-in for anything leaving, a spring curve reserved only for bottom-sheet drag-release.

**Discipline (directly reacting to the "hover transitions on every card" generic-AI tell):** the dashboard gets exactly **one** orchestrated moment per load — the hero metric's number count-up (600ms, ease-out, first mount only, never re-triggered on background refresh) and its progress ring sweeping in alongside it. Every other card renders its final state immediately. Chart draw-in (stroke animating in, 500ms) is used only the first time a chart mounts, not on every re-render or filter change.

**Reduced motion:** when `prefers-reduced-motion` is set, all transform/slide transitions become a 100ms opacity cross-fade, count-up and chart draw-in are skipped entirely (final values render instantly), and sheet/drawer/modal open still functions but without the slide.

---

## 35. Accessibility

- **Keyboard:** full tab order through every interactive element, a skip-to-content link at the top of the page, modal/drawer/sheet trap focus while open and return it to the trigger on close.
- **Focus ring:** 2px `accent-signal` outline, 2px offset, on every focusable element — never removed, never replaced by a color-only change.
- **Labels:** every icon-only button has an `aria-label`; every chart has a text-equivalent summary (`aria-describedby`) or an accessible data table alternative.
- **Contrast:** body text ≥4.5:1, large text/icons ≥3:1 — verified against the actual dark tokens in §5, not assumed (e.g. `text-secondary #A6ACBB` on `surface-1 #15171F` must be checked at implementation time, not eyeballed).
- **Touch targets:** 44×44px minimum on mobile (§33).
- **Color-blind safety:** every status signal pairs a color with an icon or shape — `success` always ships with a check glyph, `error` with an X/alert glyph, a heatmap cell's exact value is available via tooltip/long-press even if the shade is hard to distinguish.
- **Reduced motion:** respected per §34.
- **Screen-reader semantics:** one `h1` per screen, logical heading descent within cards, toast announcements use a live region, chart summaries are read before the visual.

---

## 36. Loading States

Skeleton shapes match the final component exactly (a `MetricCard` skeleton is a rectangle + a smaller rectangle, not a generic shimmer bar). Skeleton color: `surface-2` base with a `surface-3` shimmer sweep, 1.2s loop. **Load order:** hero metric and primary MetricCards resolve first; charts, heatmaps, and AI insight cards resolve after, since they're heavier and less time-critical. Sub-150ms loads never show a skeleton at all (avoids a flash-of-loading-state on fast connections).

---

## 37. Empty States

One consistent pattern: a 32px line icon (no illustration), one-line headline, one supporting sentence, optional single primary action. Copy speaks in the product's voice — states what's missing and what to do, nothing apologetic or vague.

Examples used verbatim elsewhere in this spec: *"No activity data yet."* (Insights, §29) · *"Connect your Android device to view live performance data."* (Performance, §27). Additional module examples: Notes — *"No notes yet. Create your first note."* · Calendar — *"Nothing scheduled today."* · Automations — *"No automations yet. Start from a template or build your own."*

---

## 38. Error States

- **Inline field error:** red (`error`) helper text + icon directly under the input (§14).
- **Card-level error:** icon + "Couldn't load [card name]" + Retry button, replacing only the card body — the header stays intact so the user still knows what failed.
- **Toast error:** transient action failures (§21), persists until dismissed.
- **Full-page error:** reserved for critical failures only (auth/session loss) — rare by design.
- **Automation run error:** surfaced directly in the run-history row (§23) with an expandable detail line — no separate error page.

---

## 39. Permission States

Distinct from a generic empty state — specifically for anything gated by the Android companion:

- **Not Connected:** icon + "Connect your Android device to see [X]" + a "Connect Android Companion" primary action.
- **Permission Denied:** names the exact OS permission required (Usage Access, Notification Access) and offers a direct "Open Companion Settings" action.
- **Partial Data:** available metrics render normally; unavailable ones show a small lock badge with a tooltip/long-press explanation, in place inside the same card rather than hiding the row entirely — so the user always sees the full shape of what the product can eventually show them.

A consistent lock-icon badge (16px, `text-tertiary`) marks companion-dependent fields across Performance, Apps, and Notifications even while disconnected, so the dependency is visible before the user ever tries to use the feature.

---

## 40. Stitch MCP Design Instructions

### STITCH MCP GENERATION RULES

1. Generate original CAL-EXMANAGER interfaces only — the three reference images are inspiration for structural patterns (§2), never for literal reproduction of their colors, layout chrome, or branding.
2. Use the token system defined in §5–§9 exactly as specified — do not invent new colors, spacing values, or radii. If a screen seems to need a value not defined here, flag it rather than improvising.
3. Maintain one design system across all 15 screens (§ list below) — no per-screen visual drift.
4. Generate both desktop and mobile versions of every screen, following §31/§32, not a naive vertical-stack shrink of desktop.
5. Preserve the information architecture defined in §11 (dashboard) and each module's own section (§25–§30) — do not reorganize content while generating visuals.
6. Use SVG line icons (Lucide-style, 1.75px stroke, §4) exclusively. Never emoji, never mixed icon families.
7. Use realistic sample data for previews, and label any placeholder data clearly as sample data in generation notes — never present mock numbers as if they were the empty-state or the real user's data (§29, §36).
8. Maintain consistent card dimensions and the spacing rhythm from §7–§8 across every screen.
9. Maintain the typography hierarchy from §6 — one typeface, the defined scale, no ad hoc sizes.
10. Maintain accessible contrast per §35 on every generated screen.
11. Build reusable UI patterns (the card types in §12, the `ListRow` in §17) rather than one-off layouts per screen.
12. Keep every complex workflow (Automation Builder, Add Expense, AI conversation) genuinely usable at mobile width — not simplified to the point of losing function.
13. Design actual product screens with real states (loading/empty/error/permission, §36–§39) — not marketing-only hero mockups.

**Suggested screen generation order:**
1. Desktop Dashboard · 2. Mobile Dashboard · 3. Performance · 4. Apps · 5. Alarms · 6. Notes · 7. Calendar · 8. CAL-EXPENSES · 9. Notifications · 10. Automations · 11. AI Assistant · 12. Insights · 13. Privacy · 14. Settings · 15. Profile

---

## 41. OpenCode Implementation Handoff Notes

### OPEN CODE + MCP IMPLEMENTATION HANDOFF

The implementing agent should, in order:

1. Read PRD.md completely. *(Note: PRD.md was not generated in this pass — only design.md was requested. Generate or request PRD.md before implementation begins, since several sections here — MVP scope, data architecture, Android companion strategy — are defined there, not here.)*
2. Read this design.md completely.
3. Inspect the existing CAL-EXPENSES project before writing any new code.
4. Preserve useful existing functionality — this is a redesign and expansion, not a rewrite from zero.
5. Rename the product branding to CAL-EXMANAGER throughout, per §3's rules (CAL-EXPENSES survives only as the finance module name).
6. Do not blindly rewrite working features because a screen is being restyled.
7. Use Stitch MCP to redesign the UI, following §40's generation rules exactly.
8. Keep the UI system consistent across all eleven modules — one card grammar, one token set, one navigation model.
9. Implement both responsive desktop and mobile layouts per §9/§31/§32 — not a single fixed layout.
10. Build real working workflows (Automation Builder execution, Add Expense persistence, AI conversation) rather than static Stitch-generated screens.
11. Clearly separate frontend-only functionality from Android-companion-dependent functionality at the code level, mirroring the labels used throughout this document (**REQUIRES ANDROID COMPANION** / **FUTURE INTEGRATION**).
12. Never fake system-level phone data — every companion-dependent field renders a genuine permission state (§39) until the companion is actually connected and reporting.
13. Use SVG icons instead of emoji anywhere in the implemented UI.
14. Keep components reusable — one `MetricCard`, `ListRow`, etc. implementation, not per-module copies.
15. Validate navigation and interaction behavior after implementation, including keyboard shortcuts (§10) and touch targets (§35).
16. Preserve the accessibility (§35) and performance requirements defined here and in PRD.md — they are launch requirements, not later polish.