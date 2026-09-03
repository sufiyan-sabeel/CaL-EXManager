# CAL-EXMANAGER — Personal Digital Command Center

Premium dark SaaS dashboard for personal digital life management.

**Predecessor:** CAL-EXPENSES (now finance module inside CAL-EXMANAGER)

## Brand
- **App:** `CAL-EXMANAGER` — everywhere (title, nav, manifest, PWA)
- **Finance module:** `CAL-EXPENSES` — only as module label
- **Tagline:** Personal Digital Command Center
- **Design:** Dark-first #0A0B0E canvas, Signal accent #5B6EF5, Plus Jakarta Sans, tabular-nums

## Modules
Dashboard · Performance · Apps · Alarms · Notes · Calendar · CAL-EXPENSES · Notifications · Automations · AI · Insights · Privacy · Settings · Profile

## Tech
- Next.js 14 App Router, React 18, Tailwind, Zustand, Firebase Auth (fallback local), LocalStorage provider
- Local-first, private, no cloud DB required

## Development
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production
NEXT_EXPORT=true npm run build  # static export for GitHub Pages (basePath /CaL-EXManager)
```

## GitHub Pages
- BasePath: `/CaL-EXManager`
- Deploys via `out/` static export
- Live: https://sufiyan-sabeel.github.io/CaL-EXManager/

## Design System
See `docs/design.md` and Stitch project `CAL-EXMANAGER — Personal Digital Command Center` (dark, #5B6EF5, PLUS_JAKARTA_SANS, ROUND_TWELVE)

