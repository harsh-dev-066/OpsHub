/**
 * Local mock credentials for the console sign-in flow.
 */
export const MOCK_CREDENTIALS = {
  username: 'test',
  password: 'test',
} as const

export const AUTH_STORAGE_KEY = 'opshub.auth'

export interface AuthSession {
  username: string
  authenticatedAt: string
}

export function readAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.username || !parsed?.authenticatedAt) return null
    return parsed
  } catch {
    return null
  }
}

export function writeAuthSession(session: AuthSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function verifyMockCredentials(username: string, password: string) {
  return (
    username === MOCK_CREDENTIALS.username &&
    password === MOCK_CREDENTIALS.password
  )
}
