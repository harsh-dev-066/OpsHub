import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useOptionalAuth } from '@/features/auth/auth-context'
import { authApi } from '@/lib/api'
import {
  ALL_PERMISSIONS,
  toPermissionUser,
  type Permission,
  type PermissionUser,
} from '@/lib/permissions'
import { queryKeys } from '@/lib/query/keys'
import type { Role } from '@/types/domain'

interface SessionContextValue {
  user: PermissionUser
  role: Role
  roles: Role[]
  /** Effective permissions as computed by the server. */
  permissions: readonly Permission[]
  can: (permission: Permission) => boolean
  hasPermission: (permission: Permission) => boolean
  canManageUsers: boolean
  isLoading: boolean
}

const SessionContext = createContext<SessionContextValue | null>(null)

/** Used before `/api/auth/me` resolves: no permissions, so nothing privileged flashes. */
const ANONYMOUS_USER = toPermissionUser({
  id: 'anonymous',
  name: 'Console User',
  email: '',
  roles: [],
})

function isPermission(value: string): value is Permission {
  return (ALL_PERMISSIONS as readonly string[]).includes(value)
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const auth = useOptionalAuth()
  const session = auth?.session ?? null
  const meQuery = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.me,
    enabled: Boolean(session),
    staleTime: 60_000,
  })

  const value = useMemo<SessionContextValue>(() => {
    const me = session ? meQuery.data : undefined
    const user = me ? toPermissionUser(me) : ANONYMOUS_USER
    // The server is the source of truth for authorization; the UI mirrors it.
    const permissions = (me?.permissions ?? []).filter(isPermission)
    const granted = new Set<Permission>(permissions)
    const can = (permission: Permission) => granted.has(permission)

    return {
      user,
      role: user.role,
      roles: user.roles,
      permissions,
      can,
      hasPermission: can,
      canManageUsers: can('users:write'),
      isLoading: Boolean(session) && meQuery.isLoading,
    }
  }, [session, meQuery.data, meQuery.isLoading])

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return ctx
}
