import {
  Activity,
  Building,
  ChartLine,
  Container,
  Database,
  FlaskConical,
  Gauge,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lock,
  Monitor,
  Search,
  Server,
  ShieldCheck,
  Ticket,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import type { Permission } from '@/lib/permissions'

/**
 * Copy and data for the public landing page, kept apart from layout so
 * wording can change without touching components. Numbers describe the
 * seeded demo dataset (backend `seed_demo` / MSW seed).
 */

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#roles', label: 'Roles' },
  { href: '#architecture', label: 'Architecture' },
  { href: '#stack', label: 'Tech stack' },
] as const

export const DEMO_STATS = [
  { value: '12', label: 'Properties' },
  { value: '46', label: 'Units' },
  { value: '42', label: 'Tickets' },
  { value: '4', label: 'Roles' },
] as const

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
  points: readonly string[]
}

export const FEATURES: readonly Feature[] = [
  {
    icon: LayoutDashboard,
    title: 'Portfolio dashboard',
    description:
      'See occupancy, availability and open work across every property at a glance.',
    points: [
      'Occupancy trend for the last 12 months',
      'Ticket breakdowns by status and priority',
      'Live activity feed of recent changes',
    ],
  },
  {
    icon: Building,
    title: 'Properties & units',
    description:
      'Browse the portfolio down to individual units, residents and contracts.',
    points: [
      'Search, filter and sort on the server',
      'Shareable, URL-synced list filters',
      'Unit rollups computed from live data',
    ],
  },
  {
    icon: Ticket,
    title: 'Ticket workflow',
    description:
      'Raise, assign and resolve maintenance and resident requests end to end.',
    points: [
      'Validated create and edit forms',
      'Instant status changes with rollback on failure',
      'Assign work to active team members',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    description:
      'Four roles mapped to twelve permissions, enforced by the API on every request.',
    points: [
      'UI hides what a role cannot do',
      'Server rejects it even if called directly',
      'Status changes and edits checked separately',
    ],
  },
  {
    icon: Users,
    title: 'User management',
    description:
      'Admins onboard operators, assign roles and reset passwords from one screen.',
    points: [
      'Dual-list role picker',
      'Duplicate username and email protection',
      'Deactivated users are signed out immediately',
    ],
  },
  {
    icon: KeyRound,
    title: 'Secure sessions',
    description:
      'Short-lived JWT access tokens with silent refresh and server-side revocation.',
    points: [
      'Refresh tokens rotate and are blacklisted',
      'Password changes revoke old sessions',
      'Rate-limited sign-in',
    ],
  },
]

/** Human labels for the permission matrix, grouped by area. */
export const PERMISSION_ROWS: readonly {
  area: string
  rows: readonly { permission: Permission; label: string }[]
}[] = [
  {
    area: 'Portfolio',
    rows: [
      { permission: 'dashboard:read', label: 'View dashboard' },
      { permission: 'properties:read', label: 'View properties & units' },
      { permission: 'properties:write', label: 'Edit properties & units' },
    ],
  },
  {
    area: 'Tickets',
    rows: [
      { permission: 'tickets:read', label: 'View tickets' },
      { permission: 'tickets:create', label: 'Create tickets' },
      { permission: 'tickets:edit', label: 'Edit ticket details' },
      { permission: 'tickets:transition', label: 'Change ticket status' },
    ],
  },
  {
    area: 'Administration',
    rows: [
      { permission: 'users:read', label: 'View team' },
      { permission: 'users:write', label: 'Manage users & roles' },
    ],
  },
]

export interface ArchitectureTier {
  icon: LucideIcon
  name: string
  role: string
  points: readonly string[]
}

export const ARCHITECTURE: readonly ArchitectureTier[] = [
  {
    icon: Monitor,
    name: 'React SPA',
    role: 'Browser',
    points: [
      'TanStack Router, Query & Table',
      'Typed API client with token refresh',
      'Permission-aware navigation',
    ],
  },
  {
    icon: Server,
    name: 'Django REST API',
    role: 'Application',
    points: [
      'JWT auth with rotation & revocation',
      'Permission check on every endpoint',
      'OpenAPI schema & Swagger docs',
    ],
  },
  {
    icon: Database,
    name: 'PostgreSQL',
    role: 'Data',
    points: [
      'Constraints guard data integrity',
      'Rollups computed with SQL aggregates',
      'Serverless Postgres in production',
    ],
  },
]

export const ENGINEERING_HIGHLIGHTS: readonly {
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    icon: Lock,
    title: 'Fail-closed authorization',
    description:
      'An endpoint without an explicit permission rule is denied by default.',
  },
  {
    icon: Gauge,
    title: 'Constant-query list endpoints',
    description:
      'Annotations and joins keep every list page to a fixed number of SQL queries.',
  },
  {
    icon: Layers,
    title: 'Layered backend apps',
    description:
      'Selectors for reads, services for writes, thin views, one app per domain.',
  },
  {
    icon: FlaskConical,
    title: '200+ automated tests',
    description:
      'Contract, permission-matrix and N+1 tests on the API; behaviour tests on the UI.',
  },
  {
    icon: Container,
    title: 'Docker from dev to prod',
    description:
      'Hot-reloading dev stack and a gunicorn + nginx production stack from the same images.',
  },
  {
    icon: Workflow,
    title: 'CI-gated deploys',
    description:
      'GitHub Actions must pass before Render deploys; weekly encrypted DB backups.',
  },
]

export const TECH_STACK: readonly {
  group: string
  items: readonly string[]
}[] = [
  {
    group: 'Frontend',
    items: [
      'React 19',
      'TypeScript',
      'Vite',
      'TanStack Router',
      'TanStack Query',
      'TanStack Table',
      'Tailwind CSS',
      'React Hook Form',
      'Zod',
      'Recharts',
    ],
  },
  {
    group: 'Backend',
    items: [
      'Python 3.13',
      'Django 5.2',
      'Django REST Framework',
      'SimpleJWT',
      'django-filter',
      'drf-spectacular',
      'PostgreSQL',
    ],
  },
  {
    group: 'Quality & delivery',
    items: [
      'Vitest',
      'Testing Library',
      'MSW',
      'pytest',
      'Ruff',
      'Docker',
      'GitHub Actions',
      'Render',
      'Neon',
    ],
  },
]

/** Icons for the product preview's mini sidebar. */
export const PREVIEW_NAV: readonly { icon: LucideIcon; label: string }[] = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Building, label: 'Properties' },
  { icon: Search, label: 'Units' },
  { icon: Ticket, label: 'Tickets' },
  { icon: Users, label: 'Users' },
]

/** Illustrative values matching the seeded demo data. */
export const PREVIEW_KPIS = [
  { icon: ChartLine, label: 'Occupancy', value: '60.9%' },
  { icon: Building, label: 'Available units', value: '10' },
  { icon: Ticket, label: 'Open tickets', value: '26' },
  { icon: Activity, label: 'Properties', value: '12' },
] as const

export const PREVIEW_OCCUPANCY = [
  26, 33, 39, 44, 48, 52, 59, 65, 63, 63, 65, 61,
] as const

export const PREVIEW_TICKETS = [
  { title: 'AC not cooling', place: 'Harbor View · 101', priority: 'critical' },
  { title: 'Keycard not working', place: 'Cedar Lane · 202', priority: 'high' },
  { title: 'Leaking faucet', place: 'Maple Court · 102', priority: 'medium' },
] as const
