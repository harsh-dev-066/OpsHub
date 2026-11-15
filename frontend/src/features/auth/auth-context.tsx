import { useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/lib/api'
import {
  AUTH_EXPIRED_EVENT,
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
  type AuthSession,
} from '@/lib/auth/token-storage'
import { queryKeys } from '@/lib/query/keys'

export interface AuthContextValue {
  isAuthenticated: boolean
  session: AuthSession | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useOptionalAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<AuthSession | null>(() =>
    readAuthSession(),
  )

  // The API client fires this when a refresh fails (expired/revoked session).
  useEffect(() => {
    function onExpired() {
      setSession(null)
      queryClient.clear()
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  }, [queryClient])

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await authApi.login(username.trim(), password)
      const next: AuthSession = {
        username: result.user.username,
        access: result.access,
        refresh: result.refresh,
        authenticatedAt: new Date().toISOString(),
      }
      writeAuthSession(next)
      // Prime the profile so permissions are correct on the first render.
      queryClient.setQueryData(queryKeys.auth.me(), result.user)
      setSession(next)
    },
    [queryClient],
  )

  const logout = useCallback(() => {
    const refresh = readAuthSession()?.refresh
    clearAuthSession()
    setSession(null)
    // Drop every cached payload so the next user never sees stale data.
    queryClient.clear()
    if (refresh) {
      // Best effort: the token is already gone locally.
      void authApi.logout(refresh).catch(() => undefined)
    }
  }, [queryClient])

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
