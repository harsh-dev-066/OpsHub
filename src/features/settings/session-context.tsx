import { useQuery } from '@tanstack/react-query'
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { useOptionalAuth } from '@/features/auth/auth-context'
import { MOCK_CREDENTIALS } from '@/features/auth/mock-auth'
import { usersApi } from '@/lib/api'
import {
  can as canPermission,
  hasPermission as hasPermissionCheck,
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
  can: (permission: Permission) => boolean
  hasPermission: (permission: Permission) => boolean
  /** True only for the seeded admin operator (`test`). */
  canManageUsers: boolean
  isLoading: boolean
}

const SessionContext = createContext<SessionContextValue | null>(null)

/** Optimistic profiles so UI permissions do not flash to Viewer before /api/users. */
const KNOWN_USERS: Record<string, PermissionUser> = {
  test: toPermissionUser({
    id: 'user-001',
    name: 'Alex Morgan',
    email: 'alex.morgan@opshub.app',
    roles: ['Admin'],
  }),
  priya: toPermissionUser({
    id: 'user-002',
    name: 'Priya Shah',
    email: 'priya.shah@opshub.app',
    roles: ['Operations Manager'],
  }),
  chris: toPermissionUser({
    id: 'user-003',
    name: 'Chris Lee',
    email: 'chris.lee@opshub.app',
    roles: ['Support Agent'],
  }),
  sam: toPermissionUser({
    id: 'user-004',
    name: 'Sam Rivera',
    email: 'sam.rivera@opshub.app',
    roles: ['Viewer'],
  }),
}

const FALLBACK_USER = toPermissionUser({
  id: 'user-fallback',
  name: 'Console User',
  email: 'user@opshub.app',
  roles: ['Viewer'],
})

export function SessionProvider({ children }: { children: ReactNode }) {
  const auth = useOptionalAuth()
  const session = auth?.session ?? null
  const usersQuery = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: usersApi.list,
    enabled: Boolean(session),
    staleTime: 30_000,
  })

  const value = useMemo<SessionContextValue>(() => {
    const username = session?.username
    const matched = usersQuery.data?.find(
      (entry) => entry.username === username,
    )
    const user = matched
      ? toPermissionUser({
          id: matched.id,
          name: matched.name,
          email: matched.email,
          roles: matched.roles,
        })
      : username && KNOWN_USERS[username]
        ? KNOWN_USERS[username]
        : FALLBACK_USER

    const canManageUsers =
      username === MOCK_CREDENTIALS.username &&
      canPermission(user, 'users:write')

    return {
      user,
      role: user.role,
      roles: user.roles,
      can: (permission) => canPermission(user, permission),
      hasPermission: (permission) => hasPermissionCheck(user, permission),
      canManageUsers,
      isLoading: Boolean(session) && usersQuery.isLoading,
    }
  }, [session, usersQuery.data, usersQuery.isLoading])

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
