import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { can, type Capability } from '@/lib/permissions'
import type { Role } from '@/types/domain'

const STORAGE_KEY = 'opshub.demo-role'

interface SessionContextValue {
  role: Role
  setRole: (role: Role) => void
  userName: string
  can: (capability: Capability) => boolean
}

const SessionContext = createContext<SessionContextValue | null>(null)

function readStoredRole(): Role {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (
    stored === 'Admin' ||
    stored === 'Operations Manager' ||
    stored === 'Support Agent' ||
    stored === 'Viewer'
  ) {
    return stored
  }
  return 'Operations Manager'
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => readStoredRole())

  const setRole = useCallback((next: Role) => {
    localStorage.setItem(STORAGE_KEY, next)
    setRoleState(next)
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({
      role,
      setRole,
      userName: 'Alex Morgan',
      can: (capability) => can(role, capability),
    }),
    [role, setRole],
  )

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
