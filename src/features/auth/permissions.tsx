import type { ReactNode } from 'react'
import { useSession } from '@/features/settings/session-context'
import { canAll, canAny, type Permission } from '@/lib/permissions'

export function usePermissions() {
  const { user, can, hasPermission } = useSession()

  return {
    user,
    can,
    hasPermission,
    canAny: (permissions: readonly Permission[]) => canAny(user, permissions),
    canAll: (permissions: readonly Permission[]) => canAll(user, permissions),
  }
}

export function Can({
  permission,
  permissions,
  mode = 'all',
  children,
  fallback = null,
}: {
  permission?: Permission
  permissions?: readonly Permission[]
  mode?: 'all' | 'any'
  children: ReactNode
  fallback?: ReactNode
}) {
  const { can, canAny, canAll } = usePermissions()

  const allowed = permission
    ? can(permission)
    : permissions
      ? mode === 'any'
        ? canAny(permissions)
        : canAll(permissions)
      : false

  return <>{allowed ? children : fallback}</>
}
