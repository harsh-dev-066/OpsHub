import {
  Building2,
  ClipboardList,
  DoorOpen,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Permission } from '@/lib/permissions'

export type AppNavItem = {
  to:
    | '/dashboard'
    | '/properties'
    | '/units'
    | '/tickets'
    | '/users'
    | '/settings'
  label: string
  icon: LucideIcon
  permission: Permission
}

/**
 * Primary navigation. Visibility is driven by `permission`, not role strings.
 * Filter with `hasPermission(user, item.permission)` before render.
 */
export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard:read',
  },
  {
    to: '/properties',
    label: 'Properties',
    icon: Building2,
    permission: 'properties:read',
  },
  {
    to: '/units',
    label: 'Units',
    icon: DoorOpen,
    permission: 'units:read',
  },
  {
    to: '/tickets',
    label: 'Tickets',
    icon: ClipboardList,
    permission: 'tickets:read',
  },
  {
    to: '/users',
    label: 'Users',
    icon: Users,
    permission: 'users:read',
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
    permission: 'settings:read',
  },
]

export function getVisibleNavItems(
  hasPermission: (permission: Permission) => boolean,
): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => hasPermission(item.permission))
}
