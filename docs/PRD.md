# CAL-EXMANAGER — Product Requirements Document

**Personal Digital Command Center**
Predecessor project: CAL-EXPENSES (now a module inside CAL-EXMANAGER)
Document status: v1.0 — implementation handoff spec for OpenCode + Stitch MCP
Companion document: `design.md`

**Capability legend used throughout this document:**

| Tag | Meaning |
|---|---|
| `[WEB]` | Works today in a standard browser, no special permission |
| `[PERM]` | Works in-browser but needs explicit user consent (e.g. notifications, mic, file access) |
| `[ANDROID-REQUIRED]` | Cannot be sourced from a browser at all — needs the Android companion app and an OS-level permission (Usage Access, Notification Listener, Battery stats) |
| `[FUTURE]` | Not planned for MVP or Phase 2; a directional idea only |

---

## 1. Product Overview

CAL-EXMANAGER is a personal digital-management Micro-SaaS: a single dashboard that pulls together the software-side signals of someone's daily life — money, time, tasks, notifications, and phone health — and lets an AI assistant and a lightweight automation engine act on them. It replaces the narrower CAL-EXPENSES tracker, which becomes one module (the finance module) inside the larger product.

| Item | Value |
|---|---|
| Product name | CAL-EXMANAGER |
| Tagline | Personal Digital Command Center |
| Predecessor | CAL-EXPENSES (retained as the Finance module) |
| Primary surface | Web SaaS dashboard (responsive desktop/tablet/mobile) |
| Secondary surface | Android companion app (Phase 2+), feeds data in — does not replace the web dashboard |
| Primary user | An individual managing their own digital life, not a team |

## 2. Vision

*One intelligent command center for managing your digital life, device insights, productivity, finances, and personal workflows.*

- The dashboard should feel like checking one instrument panel each morning, not opening six different apps.
- Every module should be able to talk to every other module (a calendar event can carry a budget, an alarm can trigger a routine, an automation can read a battery level and write a reminder).
- The product earns trust by being honest about what it can and can't see — it never simulates phone-level data it doesn't have.
- AI is a layer that understands the user's own stored data, not a generic chatbot bolted on the side.

## 3. Problem Statement

- People currently split personal admin across a budgeting app, a notes app, a calendar app, a clock/alarm app, and whatever screen-time tool their phone ships with — none of them talk to each other.
- CAL-EXPENSES already solved the finance piece but had nowhere to grow: no automation, no cross-module context, no device or usage insight.
- Screen-time and notification data is siloed inside the OS with no way to combine it with a person's actual calendar, spending, or task load.
- Nothing currently lets a person say "when my battery drops below 20%, alert me" or "summarize my week" and have it act across finance, time, and notes together.

## 4. Target Users

| Persona | Description | Core needs | Primary modules |
|---|---|---|---|
| The Self-Optimizer | Tracks habits and metrics about their own life for its own sake | Unified view, trend history, automation | Insights, Performance, Automations |
| The Budget-Conscious Professional | Came from CAL-EXPENSES, wants finance plus light productivity | Expense tracking, budgets, calendar bills | CAL-EXPENSES, Calendar, Notifications |
| The Student / Early-Career Builder | Juggling exams, routines, and a tight budget | Alarms tied to routines, notes, reminders | Alarms, Notes, Calendar, CAL-EXPENSES |
| The Productivity Automator | Wants "if this then that" logic across their day | Visual automation builder, AI commands | Automations, AI, Notifications |

## 5. Product Goals

1. Consolidate finance, time, notes, calendar, alarms, and device insight into one coherent information architecture.
2. Make automation genuinely usable by a non-technical person via a visual WHEN → IF → THEN builder.
3. Make the AI assistant capable of both answering questions and safely proposing data-mutating actions, always with confirmation.
4. Be architecturally honest: never claim browser access to data a browser cannot see.
5. Ship a fully useful web-only MVP that does not depend on the Android companion existing yet.
6. Preserve and elevate the existing CAL-EXPENSES functionality rather than discarding it.

## 6. Non-Goals

- Not a bank, payment processor, or account-aggregation product — CAL-EXPENSES tracks entries the user records, it does not move money.
- Not a device management (MDM) or parental-control product.
- Not a team/project-management tool — single-user product for MVP; any shared/family space is a Phase 3+ idea.
- Not attempting unrestricted browser control of Android — every device-level capability is explicitly gated behind the companion app and OS permissions.
- Not building iOS companion parity in MVP or Phase 2 (see Future Roadmap).

## 7. Core Value Proposition

- Replaces 6–9 disconnected apps (budget tracker, notes app, calendar, alarm clock, screen-time dashboard, notification log, automation app) with one command center.
- Automations that actually cross domains: a low-battery condition can create a finance reminder; an added expense can trigger an AI insight; a weekday alarm can surface the day's calendar and tasks.
- An AI assistant that is grounded in the user's own stored data, not a generic model — it cites what it changed and asks before it changes anything.
- A product that is honest about its boundaries, building long-term trust instead of overselling browser capability.

## 8. Feature Architecture

Layered architecture:

1. **Presentation layer** — responsive web dashboard (desktop/tablet/mobile), rendering all 11 modules.
2. **Module layer** — Performance, Apps, Alarms, Notes, Calendar, CAL-EXPENSES, Notifications, Automations, AI, Insights, Privacy. Each module owns its own data views but can be read by the Automation and AI layers.
3. **Automation engine** — evaluates triggers/conditions, dispatches actions, keeps an execution log.
4. **AI orchestration layer** — a server-side proxy that grounds prompts in the user's own data, executes read queries directly, and stages proposed writes for user confirmation.
5. **Data access layer** — per-user isolated data store (see §16).
6. **Integration adapter layer** — the Android companion app (Phase 2+) and any future third-party integrations (Google Calendar, bank statement import) plug in here without touching the module layer's contracts.

### 8.1 Data-source capability matrix

| Data | MVP source | Full source |
|---|---|---|
| Expenses, budgets, notes, calendar, alarms (as reminders) | `[WEB]` user-entered | `[WEB]` |
| AI conversation and automation records | `[WEB]` | `[WEB]` |
| Battery %, temperature, charging state | Not available | `[ANDROID-REQUIRED]` |
| RAM, CPU, storage breakdown | Not available | `[ANDROID-REQUIRED]` |
| Installed apps, per-app screen time | Not available | `[ANDROID-REQUIRED]` (UsageStatsManager) |
| Notification volume/content by app | Not available | `[ANDROID-REQUIRED]` + `[PERM]` (Notification Listener) |
| Device-level automation actions (e.g. silence phone) | Not available | `[ANDROID-REQUIRED]`, `[FUTURE]` (Phase 3) |
| Browser push notifications from CAL-EXMANAGER itself | `[PERM]` | `[PERM]` |

## 9. Complete Module Specifications

### 9.1 Performance
**Purpose:** Device health and performance overview.
- Battery %, charging state, temperature `[ANDROID-REQUIRED]`
- Storage breakdown, RAM/CPU usage `[ANDROID-REQUIRED]`
- Device uptime, last-sync timestamp `[ANDROID-REQUIRED]`
- Composite "device health score" computed server-side once telemetry exists `[ANDROID-REQUIRED]`
- Historical trend charts once ≥2 telemetry snapshots exist `[ANDROID-REQUIRED]`
**Primary screens:** Overview, Battery history, Storage detail.
**Core entities:** `device_telemetry_snapshot` (time-series, append-only).
**Depends on:** Privacy (permission state), Automations (as a trigger source).

### 9.2 Apps
**Purpose:** Application usage and management.
- App list, per-app duration, category `[ANDROID-REQUIRED]`
- Usage trend, "most distracting apps" insight `[ANDROID-REQUIRED]`
- Storage footprint, permission overview per app `[ANDROID-REQUIRED]`
- Search/filter/sort over the app list `[WEB]` (once data exists)
**Primary screens:** App overview, App detail, Category breakdown.
**Core entities:** `app_usage_snapshot`.
**Depends on:** Performance (shared telemetry pipeline), Insights.

### 9.3 Alarms
**Purpose:** Scheduled reminders and routine triggers.
- Create/edit alarm, repeat schedule, label, snooze config `[WEB]`
- In-app + browser-push delivery of the reminder `[PERM]`
- Actual device-level ringing alarm `[ANDROID-REQUIRED]`, `[FUTURE]`
- Routine association: "when alarm fires → show today's schedule → show tasks → start focus view" `[WEB]`
- Alarm history log `[WEB]`
**Primary screens:** Alarm list, Create/Edit alarm, Routine link picker.
**Core entities:** `alarm`, `alarm_routine_link`.
**Depends on:** Calendar, Automations, Notes (tasks).

### 9.4 Notes
**Purpose:** Full notes workspace.
- Quick notes, rich text, markdown, checklists `[WEB]`
- Folders, tags, pin, favorite, archive, search `[WEB]`
- Attachments `[WEB]`, voice-to-note `[PERM]` (microphone)
- AI summarization and AI task-extraction from a note `[WEB]` (via AI layer)
**Primary screens:** Notes list, Note editor, Folder view.
**Core entities:** `note`, `note_folder`, `note_tag`.
**Depends on:** AI, Calendar (extracted tasks/dates), Alarms.

### 9.5 Calendar
**Purpose:** Day/Week/Month scheduling surface.
- Events, tasks, reminders, exams, birthdays, bills, personal events `[WEB]`
- Cross-links: a bill event can reference a CAL-EXPENSES recurring expense; a task can originate from a Note `[WEB]`
**Primary screens:** Month view, Week view, Day view, Event detail.
**Core entities:** `calendar_event`, `event_category`.
**Depends on:** Notes, CAL-EXPENSES, Alarms, Automations, AI.

### 9.6 CAL-EXPENSES
**Purpose:** The finance module — retained and elevated from the original product.
- Daily expense/income entry, categories, budgets, recurring expenses `[WEB]`
- Weekly/monthly/yearly analytics, calendar-based spend heatmap `[WEB]`
- Transaction history, spending trend, budget progress `[WEB]`
- PDF export, CSV/data export `[WEB]`
- AI spending insight ("why did my spending increase this month?") `[WEB]` via AI layer
**Primary screens:** Overview, Transactions, Budgets, Analytics, Export.
**Core entities:** `expense`, `income`, `category`, `budget`, `recurring_expense`.
**Depends on:** Calendar, AI, Automations, Insights.

### 9.7 Notifications
**Purpose:** Analytics on the notifications the user's phone receives (distinct from CAL-EXMANAGER's own in-app alerts — see PRD §19).
- Notifications today, by app, by time-of-day `[ANDROID-REQUIRED]` + `[PERM]` (Notification Listener)
- Most-active apps, distraction insight `[ANDROID-REQUIRED]`
- Notification history (metadata only, never message content is stored) `[ANDROID-REQUIRED]` + `[PERM]`
**Primary screens:** Overview, By-app breakdown, Time-of-day heatmap.
**Core entities:** `notification_event` (app id, category, timestamp — no message body).
**Depends on:** Privacy (permission gate), Insights, Automations.

### 9.8 Automations
**Purpose:** Visual WHEN → IF → THEN workflow builder; one of the product's most important modules.
- Triggers: time-based `[WEB]`, calendar-based `[WEB]`, expense-based `[WEB]`, battery/notification-based `[ANDROID-REQUIRED]`
- Conditions: value comparisons, device-connected state, time windows `[WEB]`
- Actions: create reminder/notification, update a budget, generate an AI insight `[WEB]`; device-side actions (e.g. silence phone) `[ANDROID-REQUIRED]`, `[FUTURE]`
- Execution history, enable/disable per automation, template gallery, error states, permission gating, loop/rate protection `[WEB]`
**Primary screens:** Automation list, Builder, Template gallery, Execution history.
**Core entities:** `automation`, `automation_step`, `automation_run`.
**Depends on:** every module (it is the cross-module glue layer), Privacy (permission gate), AI (NL creation).

### 9.9 AI
**Purpose:** A first-class assistant grounded in the user's own CAL-EXMANAGER data.
- Global command palette + dedicated AI conversation page `[WEB]`
- Read intents (spending, schedule, app usage summaries) answered directly from stored data `[WEB]`
- Write intents (create expense/reminder/automation) staged as a confirm-before-write preview, never executed silently `[WEB]`
- Contextual "ask AI about this page" entry point inside each module `[WEB]`
**Primary screens:** AI conversation page, inline AI action preview, contextual AI trigger.
**Core entities:** `ai_conversation`, `ai_message`, `ai_proposed_action`.
**Depends on:** all modules (read access), Automations (can create automations via NL).

### 9.10 Insights
**Purpose:** Personal analytics center, cross-module.
- Weekly digital-activity digest, screen-time/app/expense/productivity trend `[WEB]` for software data, `[ANDROID-REQUIRED]` for device/app data
- Activity heatmap (contribution-style), category breakdown, timeline `[WEB]`
- Never fabricates statistics; every widget has its own empty state ("No activity data yet.") `[WEB]`
**Primary screens:** Insights overview, per-module trend drill-down.
**Core entities:** Read-only aggregation views over other modules' tables; no new source-of-truth data.
**Depends on:** all modules.

### 9.11 Privacy
**Purpose:** Dedicated data-control center.
- Per-category data permission toggles, connected-device list, AI-processing opt-out `[WEB]`
- Export data (per-module and full bundle), delete data/account `[WEB]`
- Local vs. cloud data indicator, integration/connected-service permissions `[WEB]`
**Primary screens:** Data & Permissions, Connected Devices, AI Processing, Export, Delete.
**Core entities:** `privacy_consent`, `connected_device`.
**Depends on:** every module that stores personal data.

## 10. User Journeys

1. **Onboarding:** sign up → set currency/timezone → pick starter dashboard widgets → optional "connect Android companion later" skip.
2. **Morning routine:** 6:00 AM alarm fires → automation shows today's calendar + open tasks → user marks a task done from the notification.
3. **Logging an expense via AI:** user opens AI, types "add ₹250 for lunch under Food" → AI stages a preview card → user confirms → entry appears in CAL-EXPENSES and today's dashboard metric updates.
4. **Connecting the Android companion (Phase 2):** user opens Privacy → Connected Devices → generates a pairing code → enters it in the companion app → grants Usage Access/Notification Listener → Performance/Apps/Notifications modules move from "not connected" to live data.
5. **Building an automation:** user opens Automations → Template gallery → picks "Big expense alert" → configures the ₹ threshold → enables it → sees it fire in Execution history the next time a matching expense is logged.

## 11. Dashboard Requirements

- Modular, reorderable widget grid; default widget set for a new MVP user: Today's Expenses, Upcoming Events, Recent Notes, Automation Status, AI Insight, Activity Heatmap.
- Once companion is connected, Device Health, Battery, Screen Time, and App Usage widgets become available to add.
- Widgets persist per-user layout; reorder via drag handle (desktop) or long-press (mobile); each widget can be hidden/shown independently.
- Each widget loads and fails independently — one slow or errored widget never blocks the rest of the dashboard.
- Greeting area shows name, local date/time, and a one-line AI-generated summary once enough data exists (never fabricated when data is absent).

## 12. AI Requirements

- Supported intent categories: **Query** (read-only questions), **Create** (expense, note, reminder, event), **Explain** (why did X happen), **Automate** (create an automation from natural language).
- Every write-intent produces a preview object the user must explicitly confirm, edit, or cancel before anything is persisted.
- All model calls happen through a server-side proxy; no API key is ever present in frontend code or bundle.
- Responses must be grounded only in the user's actual stored data — the AI must say "I don't have that data yet" rather than invent a figure.
- Rate limiting and per-user usage caps enforced server-side.

## 13. Automation Requirements

- Trigger types: schedule/time, calendar event, expense threshold, device telemetry (`[ANDROID-REQUIRED]`), notification event (`[ANDROID-REQUIRED]`).
- Condition types: value comparison, time window, device-connected state, boolean AND/OR chaining.
- Action types: create in-app notification/reminder, update budget, generate AI insight, create calendar event; device-side actions are `[ANDROID-REQUIRED]`, `[FUTURE]`.
- Every automation has an enabled/disabled toggle, an execution history entry per run (trigger snapshot, condition result, action result, status), and a loop-guard (max N executions per hour per automation) to prevent runaway loops.
- Automations that reference companion-only data are visibly disabled with a "Requires Android Companion" state until the device is connected — they are never silently skipped without explanation.

## 14. Android Companion Integration Strategy

- **Why it's needed:** a browser sandbox cannot read battery/CPU/RAM stats, the installed-app list, per-app usage, or notification content — this is an OS-level restriction, not a product choice.
- **What the companion provides:** battery/charging telemetry, storage/RAM/CPU snapshots, app usage via Android's UsageStatsManager, notification metadata via a user-granted Notification Listener service.
- **Pairing:** the companion authenticates as the same account (shared auth token) and is linked via a short-lived pairing code generated in Privacy → Connected Devices.
- **Sync model:** periodic authenticated snapshot upload (MVP+Phase 2); a persistent connection for near-real-time updates is a `[FUTURE]` enhancement.
- **Explicit boundary:** the web app never gains unrestricted OS access — every capability requires the companion to exist **and** the corresponding Android permission to be separately granted by the user.
- **Phasing:**
  - MVP — fully usable with zero companion; all Android-required modules show a clear "not connected" state.
  - Phase 2 — companion provides read-only telemetry (Performance, Apps, Notifications modules go live).
  - Phase 3 `[FUTURE]` — limited, permission-scoped bi-directional actions (e.g. muting the phone from an automation); still bounded by what Android's permission model allows, never "unrestricted control."

## 15. Authentication

- Recommended stack (to be verified against the existing CAL-EXPENSES repository before implementation, per Automation Handoff §41): Firebase Authentication for identity (email/password + Google OAuth), consistent with the existing CAL-EXPENSES app.
- Session handling via Firebase session tokens; multi-device sessions supported.
- Android companion pairing uses a short-lived, single-use pairing code tied to the authenticated account — never a shared long-lived secret.
- Account deletion cascades to all owned data across every module (see §17).

## 16. Data Architecture

- Recommended system of record: Supabase Postgres (consistent with the existing CAL-EXPENSES app), with row-level security enforcing per-user data isolation on every table.
- Firebase Auth UID is the foreign key synced into Supabase's `users` table.
- Realtime subscriptions power live dashboard widgets (e.g. an expense added in one tab updates another open tab).
- `device_telemetry_snapshot`, `app_usage_snapshot`, and `notification_event` are append-only time-series tables, ingested from the Android companion.
- `automation_run` is an append-only execution log, never mutated after creation.
- Core entity list: `users`, `expense`, `income`, `category`, `budget`, `recurring_expense`, `note`, `note_folder`, `calendar_event`, `alarm`, `automation`, `automation_run`, `device_telemetry_snapshot`, `app_usage_snapshot`, `notification_event`, `ai_conversation`, `ai_proposed_action`, `privacy_consent`, `connected_device`.

## 17. Privacy

- User owns all their data; nothing is sold or shared with third parties.
- Per-category consent toggles (e.g. "allow AI to read my expenses") independent of each other.
- Full data export (JSON/CSV) and full account deletion available self-serve, with a typed-confirmation step for deletion.
- Notification content is never stored — only app identifier, category, and timestamp.
- Companion permissions can be revoked at any time from Privacy → Connected Devices, immediately halting new telemetry ingestion.

## 18. Security

- No AI or third-party API key is ever present in client-side code; all model and integration calls route through a server-side proxy.
- Row-level security enforced at the database layer, not just in application code.
- Every automation-triggered data mutation is written to an audit log (`automation_run`) including what changed and why.
- Companion pairing codes are short-lived and single-use; devices can be individually revoked.
- Data encrypted at rest and in transit via the underlying platform defaults (Supabase/Firebase).

## 19. Notifications (system alerting, distinct from the Notifications module)

This section covers how CAL-EXMANAGER itself notifies the user — not the Notifications *module*, which analyzes the user's incoming phone notifications (§9.7).

- Delivery channels: in-app toast, browser push `[PERM]`, optional email digest.
- Triggered by: automation actions, budget threshold crossed, upcoming calendar event/bill, AI-flagged insight.
- User controls which channels are active per trigger type from Settings.

## 20. Analytics

Two distinct things share this word in the brief:

- **Product analytics** (how CAL-EXMANAGER itself is used) — opt-in, privacy-respecting, aggregate only; used by the team building the product, not shown to the end user.
- **User-facing personal analytics** — this is the Insights module (§9.10) and is the user's own data reflected back to them, never aggregated across users.

## 21. Export

- Per-module export: CSV/JSON for expenses, notes, calendar, automation history.
- PDF export specifically for CAL-EXPENSES monthly/yearly reports.
- Full-account export bundle (all modules, single archive) from Privacy.
- Scheduled/automatic recurring export is `[FUTURE]`.

## 22. Responsive Requirements

- Desktop: persistent sidebar, multi-column bento dashboard, large charts, contextual right-rail panels.
- Tablet: collapsible icon-only sidebar, adaptive grid, reduced secondary panels.
- Mobile: top bar + bottom navigation, horizontally scrollable secondary metric groups, full-screen sheets for multi-step flows, expandable cards instead of always navigating away. Mobile must never be a naive vertical stack of every desktop card — see `design.md` §31 for the full mobile information architecture.

## 23. Accessibility

- Target WCAG 2.1 AA across the product.
- Minimum 4.5:1 contrast for body text, 3:1 for large text and UI components.
- Full keyboard operability with a visible focus state at all times.
- Charts never rely on color alone and expose an accessible text/table summary.
- Minimum 44×44px touch targets on mobile; motion respects `prefers-reduced-motion`.

## 24. Performance

- Independent per-widget loading so one slow data source never blocks the dashboard shell.
- Code-splitting per module; modules not yet visited are not loaded.
- Virtualized lists for anything that can exceed ~50 rows (transactions, notification history, automation log).
- Companion telemetry polling uses backoff and a sane budget — no aggressive constant polling.

## 25. Error Handling

- Each module renders inside its own error boundary; one module's failure does not crash the dashboard shell.
- Automation failures are logged with a clear reason (e.g. "skipped — companion not connected") rather than failing silently.
- AI failures return an honest "couldn't complete that" message — never a fabricated answer.
- Network loss shows a persistent, non-blocking banner; queued actions (e.g. an automation waiting to fire) resume on reconnect.

## 26. MVP Scope (web-only, no companion required)

- Auth, dashboard shell with default widgets and reordering.
- Full CAL-EXPENSES module.
- Notes, Calendar, Alarms (in-app/push reminders — real device alarms are `[ANDROID-REQUIRED]`/`[FUTURE]`).
- Automations limited to web-only triggers/actions (time, calendar, expense-based).
- AI: query and create intents across the above modules, with confirm-before-write.
- Privacy basics: export, delete, consent toggles.
- Insights: activity heatmap and trends built from software-only data (expenses, notes, tasks) — Performance/Apps/device-based Notifications show a clear "not connected" state.

## 27. Phase 2

- Android Companion v1: read-only telemetry (battery, storage, RAM/CPU where the OS allows it, app usage, notification metadata via Notification Listener).
- Performance, Apps, and Notifications modules go fully live.
- Automation triggers expand to device-based conditions (notify-only actions).
- Insights and AI gain device-aware context.

## 28. Phase 3

- Limited, permission-scoped bi-directional automation actions via the companion `[FUTURE]`.
- Customizable dashboard widget marketplace.
- Optional light theme.
- Third-party integrations: two-way Google Calendar sync, bank-statement import for CAL-EXPENSES.
- Optional shared/family space (monetization opportunity, out of scope for MVP).

## 29. Future Roadmap

- Limited cross-platform companion parity (e.g. iOS Shortcuts-based, inherently more restricted than Android).
- Predictive AI insights (trend forecasting, not just historical summary).
- Offline-first companion caching for spotty connectivity.
- An automation template/plugin marketplace.
- A desktop companion app for laptop-level telemetry.

## 30. Acceptance Criteria

- **Dashboard load:** Given a logged-in user, when the dashboard loads, then each widget renders independently and a widget with no data shows its own empty state rather than blocking the page.
- **AI-created expense:** Given a user asks the AI to add an expense, when the AI stages the preview, then no database write occurs until the user explicitly confirms.
- **Automation with missing capability:** Given an automation references a companion-only trigger and no companion is connected, when the automation would evaluate, then it is shown as disabled with a "Requires Android Companion" reason, and no execution is fabricated.
- **Companion not connected:** Given the companion has never been paired, when the user opens Performance, then the screen shows a "Connect your Android device to view live performance data" state, not zeros or placeholder numbers presented as real.
- **Data export:** Given a user requests a full data export, when the export completes, then it contains every module's data in the documented format and nothing is silently omitted.
- Acceptance criteria for any Phase 2/3 companion-dependent feature are conditional on the companion existing and are not testable in the MVP build.