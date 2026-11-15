/**
 * Persists the signed-in session (JWT pair + username) in localStorage.
 *
 * Trade-off: localStorage is readable by any script on the page, so an XSS
 * bug could leak the refresh token. Mitigations are short-lived access
 * tokens, refresh rotation, and server-side blacklisting on logout. Moving
 * the refresh token to an httpOnly cookie is the hardening path when the SPA
 * and API share a site.
 */

export const AUTH_STORAGE_KEY = 'opshub.auth'

/** Fired on `window` when the session can no longer be refreshed. */
export const AUTH_EXPIRED_EVENT = 'opshub:auth-expired'

export interface AuthSession {
  username: string
  access: string
  refresh: string
  authenticatedAt: string
}

export function readAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthSession>
    if (!parsed?.username || !parsed.access || !parsed.refresh) return null
    return parsed as AuthSession
  } catch {
    return null
  }
}

export function writeAuthSession(session: AuthSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function updateAuthTokens(access: string, refresh?: string) {
  const current = readAuthSession()
  if (!current) return
  writeAuthSession({ ...current, access, refresh: refresh ?? current.refresh })
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
