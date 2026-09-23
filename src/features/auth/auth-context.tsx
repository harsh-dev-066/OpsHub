import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearAuthSession,
  readAuthSession,
  verifyMockCredentials,
  writeAuthSession,
  type AuthSession,
} from '@/features/auth/mock-auth'

export interface AuthContextValue {
  isAuthenticated: boolean
  session: AuthSession | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    readAuthSession(),
  )

  const login = useCallback(async (username: string, password: string) => {
    // Simulate a short network delay for realistic UX.
    await new Promise((resolve) => {
      window.setTimeout(resolve, 250)
    })

    if (!verifyMockCredentials(username.trim(), password)) {
      throw new Error('Invalid username or password.')
    }

    const next: AuthSession = {
      username: username.trim(),
      authenticatedAt: new Date().toISOString(),
    }
    writeAuthSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(session),
      session,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
