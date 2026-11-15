/**
 * Runtime configuration from Vite env vars.
 *
 * - `VITE_USE_MOCKS=true` serves `/api/*` from MSW (offline dev / demos without a backend).
 * - `VITE_API_BASE_URL` points at the Django API when it lives on another
 *   origin. Leave empty in dev: Vite proxies `/api` to the backend.
 * - `VITE_DEMO_PASSWORD` is a public hint shown on the login page for the
 *   seeded demo users (baked into the bundle at build time — not a secret).
 */
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCKS === 'true'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(
  /\/+$/,
  '',
)

/** Password shown for seeded demo accounts when not in mock mode. */
export const DEMO_PASSWORD =
  (import.meta.env.VITE_DEMO_PASSWORD as string | undefined)?.trim() ||
  'opshub-demo'
