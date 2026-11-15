import {
  Building,
  ChartLine,
  ClipboardList,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Ticket,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#workflow', label: 'How it works' },
  { href: '#roles', label: 'Roles' },
] as const

export const FEATURES: readonly {
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    icon: LayoutDashboard,
    title: 'Portfolio overview',
    description:
      'Occupancy, vacancies and open work across every property, updated as things change.',
  },
  {
    icon: Building,
    title: 'Properties and units',
    description:
      'Every building, unit, resident and lease in one searchable place.',
  },
  {
    icon: Ticket,
    title: 'Maintenance tickets',
    description:
      'Log issues, set priority, assign an owner and follow them through to resolution.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    description: 'Each person sees and changes only what their role allows.',
  },
]

export const WORKFLOW: readonly {
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    icon: ChartLine,
    title: 'Spot what needs attention',
    description:
      'Start from the dashboard: occupancy trends, open tickets by priority and recent activity.',
  },
  {
    icon: ClipboardList,
    title: 'Raise and assign',
    description:
      'Create a ticket against a property or unit and hand it to the right person.',
  },
  {
    icon: Wrench,
    title: 'Resolve and close',
    description:
      'Move work from open to resolved, with every change visible to the team.',
  },
]

export const ROLES: readonly {
  name: string
  summary: string
  can: readonly string[]
}[] = [
  {
    name: 'Admin',
    summary: 'Runs the workspace.',
    can: [
      'Everything an Operations Manager can do',
      'Add users and assign roles',
      'Reset passwords and deactivate accounts',
    ],
  },
  {
    name: 'Operations Manager',
    summary: 'Owns the portfolio day to day.',
    can: [
      'Update properties and units',
      'Create, assign and close tickets',
      'See the full dashboard',
    ],
  },
  {
    name: 'Support Agent',
    summary: 'Works the ticket queue.',
    can: [
      'Create and update tickets',
      'Move tickets through each status',
      'Look up properties and units',
    ],
  },
  {
    name: 'Viewer',
    summary: 'Stays informed, changes nothing.',
    can: [
      'See the dashboard',
      'Browse properties and units',
      'Follow ticket progress',
    ],
  },
]

/** Product preview (illustrative values). */
export const PREVIEW_NAV: readonly { icon: LucideIcon; label: string }[] = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Building, label: 'Properties' },
  { icon: Search, label: 'Units' },
  { icon: Ticket, label: 'Tickets' },
  { icon: Users, label: 'Users' },
]

export const PREVIEW_KPIS = [
  { icon: ChartLine, label: 'Occupancy', value: '60.9%' },
  { icon: Building, label: 'Available units', value: '10' },
  { icon: Ticket, label: 'Open tickets', value: '26' },
  { icon: LayoutDashboard, label: 'Properties', value: '12' },
] as const

export const PREVIEW_OCCUPANCY = [
  26, 33, 39, 44, 48, 52, 59, 65, 63, 63, 65, 61,
] as const

export const PREVIEW_TICKETS = [
  { title: 'AC not cooling', place: 'Harbor View · 101', priority: 'critical' },
  { title: 'Keycard not working', place: 'Cedar Lane · 202', priority: 'high' },
  { title: 'Leaking faucet', place: 'Maple Court · 102', priority: 'medium' },
] as const
