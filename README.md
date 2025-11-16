<div align="center">

# Linear Algebra Pro — Client

Matrix tooling, lightweight ML playground, and an interactive knowledge hub in one cohesive Next.js experience.

</div>

---

## Overview

This repo contains the **Linear Algebra Pro** front-end: a Next.js 16 (App Router) application that lets you build matrices, run core/advanced operations, train toy linear regression models, and explore a curated knowledge hub that links all of the math concepts together.  

The UI keeps everything within three primary tabs:

1. **Matrix Operations** – create matrices from CSV input, auto-save drafts, run operations, and manage results in a real-time sidebar that can be collapsed when you need more canvas space.
2. **Linear Regression** – train/predict/manage models via the companion API, inspect weights/bias, and visualize training history.
3. **Knowledge Hub** – narrative-driven explanations (PCA, SVD, QR, etc.) that stay in sync with the rest of the app’s terminology.

---

## Key Features

- ✍️ **Matrix Workspace** – parse comma-separated values, choose valid dimensions, preview results, and store matrices with edit/duplicate/delete actions.
- 🧮 **Operations Suite** – core operations plus advanced panes for PCA/SVD/QR-style workflows (implemented via the shared API).
- 💾 **Saved Matrices Panel** – fixed sidebar that can now be collapsed/expanded and maintains counts + quick actions.
- 🤖 **Linear Regression Lab** – train models (SGD/Momentum/Adam), inspect metadata, copy IDs, and render loss history charts.
- 📚 **Knowledge Hub** – narrative cards, algorithm explainers, and regression storyline that reference app primitives.
- 🌗 **Dark Mode Ready** – Tailwind-utility approach for light/dark parity.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components disabled via `"use client"` per page)
- **Language:** TypeScript + React 19
- **Styling:** Tailwind utility classes (no global Tailwind config required via Next/TW 4)
- **Charts:** Recharts via `LossHistoryChart` (see `components/ml`)
- **Fonts:** Geist & Geist Mono via `next/font`

---

## Requirements

- Node.js 18.18+ (or any version supported by Next.js 16)
- npm 9+ (or compatible package manager)
- Access to a running **Linear Algebra Pro API** (see env configuration)

---

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Choose an API target**

   - Use `.env.local` (recommended) – see [Environment Configuration](#environment-configuration).
   - Or rely on the provided npm scripts (`dev:local`, `dev:deployed`).

3. **Run the dev server**

   ```bash
   npm run dev    # honors .env.local by default
   ```

4. Open [http://localhost:3000](http://localhost:3000) and start exploring the tabs.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server using `.env.local`. |
| `npm run dev:local` | Force API base URL to `http://localhost:3001`. |
| `npm run dev:deployed` | Force API base URL to the deployed server. |
| `npm run build` | Production build using `.env.local`. |
| `npm run build:local` | Production build targeting local API. |
| `npm run build:deployed` | Production build targeting deployed API. |
| `npm run start` | Run the Next.js production server (after `build`). |
| `npm run lint` | Run ESLint with the Next.js config. |

---

## Environment Configuration

The UI talks to an API via `NEXT_PUBLIC_API_BASE_URL`. You can set it in multiple ways:

### Using `.env.local` (preferred)

```bash
cp .env.example .env.local
```

Default contents:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Using scripts

- `npm run dev:local` → automatically injects `http://localhost:3001`
- `npm run dev:deployed` → automatically injects `https://linear-algebra-pro-server.vercel.app`

### Building for different targets

```
npm run build:local
npm run build:deployed
npm run build        # uses .env.local
```

### Production deployment (Vercel)

In Vercel’s dashboard:

1. Go to **Project Settings → Environment Variables**
2. Add `NEXT_PUBLIC_API_BASE_URL=https://linear-algebra-pro-server.vercel.app`
3. Scope it to Production (and Preview if desired)
4. Redeploy

> **Reminder:** Only variables prefixed with `NEXT_PUBLIC_` are accessible on the client.

---

## Project Structure (high-level)

```
app/
 ├─ home/               # Matrix operations workspace
 ├─ linear-regression/  # ML playground
 ├─ knowledge-hub/      # Narrative reference tab
 └─ globals.css         # Base styles (Geist font)
components/
 ├─ matrix/             # Matrix-specific UI pieces
 ├─ operations/         # Operation panes
 ├─ ui/                 # Header, Navigation, Sidebar, etc.
lib/
 ├─ hooks/              # Client hooks (e.g., localStorage matrix store)
 └─ utils/              # API + matrix utilities
```

---

## UI Notes

- **Navigation:** The pill-style nav in `components/ui/Navigation.tsx` keeps tab switches smooth and consistent across pages.
- **Saved Matrices Panel:** `components/ui/Sidebar.tsx` is now collapsible (`Show/Hide` button in page header + “Hide” action inside the panel itself). The main content automatically expands when hidden.
- **Linear Regression:** Pages under `app/linear-regression` rely on API helpers in `lib/utils/api.ts`. Ensure that API is reachable before training/predicting.
- **Knowledge Hub:** Entirely client-side, so it works offline once bundled—helpful for demos.

---

## Development Workflow Tips

- **Matrix drafts** are persisted via `useMatrixStorage` (localStorage). Clear browser storage if you need a clean slate.
- **Advanced operations panes** depend on `onSaveResult` to capture derived matrices—wire new operations through that callback to reuse persistence.
- **Charting** lives in `LossHistoryChart.tsx`. If you expand analytics, keep the data shape consistent with `getModelHistory`.
- **Dark Mode** is purely CSS class-based (no JS toggles needed). When introducing new components, follow the `.dark:` utility approach.

---

## Testing & Linting

- Run `npm run lint` before committing; ESLint is configured via `eslint-config-next`.
- Component-level tests are not yet included—PRs adding Vitest/Playwright coverage are welcome.
- For UI validation, manually exercise:
  - Matrix creation + sidebar collapse/expand
  - Linear regression train/predict/model tabs
  - Knowledge hub expanding cards

---

## Deployment

1. `npm run build` (or the `:local` / `:deployed` variants).
2. `npm run start` locally to smoke-test the production bundle.
3. Deploy to Vercel (recommended) or any Node-capable host.

If you are automating, ensure the `NEXT_PUBLIC_API_BASE_URL` env var is set in CI/CD before the build step.

---

## Troubleshooting

| Issue | Fix |
| --- | --- |
| API calls fail locally | Ensure the server is running on port `3001` or update `.env.local`. |
| Saved matrices disappear | Check browser localStorage; the feature is client-side only. |
| Sidebar overlaps content on small screens | Toggle it closed via the header button; layout is responsive but assumes ≥1024px for dual-column matrix panes. |
| Fonts look off | Confirm `next/font` assets are loading; see console for CSP errors if self-hosting. |

---

## Contributing

1. Fork or branch off `master`.
2. Run `npm run lint` before pushing.
3. Submit a PR describing the change (UI screenshots encouraged for UX tweaks).

---

Questions or ideas? File an issue or start a discussion—happy to iterate! 🚀
