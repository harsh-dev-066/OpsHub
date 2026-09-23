import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  can as canPermission,
  hasPermission as hasPermissionCheck,
  isRole,
  type Permission,
  type PermissionUser,
} from '@/lib/permissions'
import type { Role } from '@/types/domain'

const STORAGE_KEY = 'opshub.demo-role'

interface SessionContextValue {
  user: PermissionUser
  role: Role
  setRole: (role: Role) => void
  can: (permission: Permission) => boolean
  hasPermission: (permission: Permission) => boolean
}

const SessionContext = createContext<SessionContextValue | null>(null)

function readStoredRole(): Role {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isRole(stored) ? stored : 'Operations Manager'
}

function buildUser(role: Role): PermissionUser {
  return {
    id: 'user-demo',
    name: 'Alex Morgan',
    email: 'alex.morgan@opshub.demo',
    role,
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => readStoredRole())

  const setRole = useCallback((next: Role) => {
    localStorage.setItem(STORAGE_KEY, next)
    setRoleState(next)
  }, [])

  const value = useMemo<SessionContextValue>(() => {
    const user = buildUser(role)
    return {
      user,
      role,
      setRole,
      can: (permission) => canPermission(user, permission),
      hasPermission: (permission) => hasPermissionCheck(user, permission),
    }
  }, [role, setRole])

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
