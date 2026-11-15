# Theme

Design tokens live in `src/theme/`. Change colors and shared styles there — not in feature components.

| File | Role |
| --- | --- |
| `colors.css` | Semantic palette (surfaces, brand, feedback, chart) |
| `tokens.css` | Radius, fonts, elevation, layout, motion |
| `tailwind.css` | Maps tokens → Tailwind utilities (`bg-primary`, `text-success`, …) |
| `base.css` | Global base styles |
| `charts.ts` / `index.ts` | JS colors for Recharts and other non-CSS APIs |
| `index.css` | App entry (imported from `main.tsx`) |

## Usage

- UI: Tailwind classes — `bg-primary`, `text-muted-foreground`, `bg-success`, `rounded-lg`
- Charts / canvas: `import { chartColors } from '@/theme'`
- Status badges: theme `success` / `warning` / `danger` / `info` utilities

`src/styles/index.css` is no longer used; import `@/theme/index.css` from the app entry.
