import type {
  ActivityItem,
  Contract,
  OccupancyPoint,
  Property,
  Resident,
  Ticket,
  Unit,
  User,
} from '@/types/domain'

const propertySeeds: Array<
  Omit<
    Property,
    'totalUnits' | 'occupiedUnits' | 'availableUnits' | 'maintenanceUnits'
  >
> = [
  {
    id: 'prop-001',
    name: 'Harbor View Residences',
    city: 'Singapore',
    country: 'Singapore',
    address: '12 Marina Boulevard',
    status: 'active',
    manager: 'Aisha Rahman',
    createdAt: '2023-01-15T08:00:00.000Z',
  },
  {
    id: 'prop-002',
    name: 'Cedar Lane Collective',
    city: 'Tokyo',
    country: 'Japan',
    address: '8 Shibuya Crossing',
    status: 'active',
    manager: 'Kenji Sato',
    createdAt: '2023-03-02T08:00:00.000Z',
  },
  {
    id: 'prop-003',
    name: 'Maple Court Studios',
    city: 'Seoul',
    country: 'South Korea',
    address: '45 Gangnam-daero',
    status: 'active',
    manager: 'Minji Park',
    createdAt: '2023-04-18T08:00:00.000Z',
  },
  {
    id: 'prop-004',
    name: 'Riverbend House',
    city: 'Bangkok',
    country: 'Thailand',
    address: '99 Sukhumvit Road',
    status: 'maintenance',
    manager: 'Somsak Chai',
    createdAt: '2023-05-10T08:00:00.000Z',
  },
  {
    id: 'prop-005',
    name: 'Northgate Apartments',
    city: 'Hong Kong',
    country: 'Hong Kong',
    address: '3 Central Pier',
    status: 'active',
    manager: 'Grace Li',
    createdAt: '2023-06-01T08:00:00.000Z',
  },
  {
    id: 'prop-006',
    name: 'Sunset Lofts',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    address: '21 Bukit Bintang',
    status: 'active',
    manager: 'Daniel Tan',
    createdAt: '2023-07-12T08:00:00.000Z',
  },
  {
    id: 'prop-007',
    name: 'Oakwood Commons',
    city: 'Manila',
    country: 'Philippines',
    address: '7 Makati Avenue',
    status: 'inactive',
    manager: 'Isabel Cruz',
    createdAt: '2023-08-20T08:00:00.000Z',
  },
  {
    id: 'prop-008',
    name: 'Beacon Hill Residences',
    city: 'Singapore',
    country: 'Singapore',
    address: '55 Orchard Road',
    status: 'active',
    manager: 'Aisha Rahman',
    createdAt: '2023-09-05T08:00:00.000Z',
  },
  {
    id: 'prop-009',
    name: 'Lakeside Quarters',
    city: 'Jakarta',
    country: 'Indonesia',
    address: '14 Sudirman Street',
    status: 'active',
    manager: 'Budi Santoso',
    createdAt: '2023-10-11T08:00:00.000Z',
  },
  {
    id: 'prop-010',
    name: 'Pinecrest Living',
    city: 'Tokyo',
    country: 'Japan',
    address: '2 Roppongi Hills',
    status: 'active',
    manager: 'Kenji Sato',
    createdAt: '2023-11-02T08:00:00.000Z',
  },
  {
    id: 'prop-011',
    name: 'Skyline Place',
    city: 'Seoul',
    country: 'South Korea',
    address: '18 Yeouido Park',
    status: 'maintenance',
    manager: 'Minji Park',
    createdAt: '2023-12-14T08:00:00.000Z',
  },
  {
    id: 'prop-012',
    name: 'Eastside Collective',
    city: 'Bangkok',
    country: 'Thailand',
    address: '30 Silom Road',
    status: 'active',
    manager: 'Somsak Chai',
    createdAt: '2024-01-20T08:00:00.000Z',
  },
]

const unitTypes = ['studio', '1br', '2br', '3br', 'shared'] as const
const firstNames = [
  'Alex',
  'Jordan',
  'Sam',
  'Taylor',
  'Morgan',
  'Casey',
  'Riley',
  'Quinn',
  'Avery',
  'Jamie',
  'Cameron',
  'Drew',
]
const lastNames = [
  'Nguyen',
  'Patel',
  'Kim',
  'Wong',
  'Garcia',
  'Chen',
  'Ali',
  'Singh',
  'Brown',
  'Lopez',
  'Ito',
  'Santos',
]

function buildUnitsAndResidents() {
  const units: Unit[] = []
  const residents: Resident[] = []
  const contracts: Contract[] = []
  let unitCounter = 1
  let residentCounter = 1
  let contractCounter = 1

  for (const property of propertySeeds) {
    const unitCount = property.id === 'prop-007' ? 2 : 4
    for (let i = 0; i < unitCount; i += 1) {
      const unitId = `unit-${String(unitCounter).padStart(3, '0')}`
      const floor = Math.floor(i / 2) + 1
      const unitNumber = `${floor}${String((i % 2) + 1).padStart(2, '0')}`
      const type = unitTypes[i % unitTypes.length]!
      const statusRoll = (unitCounter + i) % 10
      const status: Unit['status'] =
        statusRoll < 6
          ? 'occupied'
          : statusRoll < 8
            ? 'available'
            : statusRoll < 9
              ? 'maintenance'
              : 'reserved'

      let residentName: string | null = null
      let contractStart: string | null = null
      let contractEnd: string | null = null

      if (status === 'occupied' || status === 'reserved') {
        const first = firstNames[unitCounter % firstNames.length]!
        const last = lastNames[i % lastNames.length]!
        residentName = `${first} ${last}`
        const residentId = `res-${String(residentCounter).padStart(3, '0')}`
        const moveIn = new Date(2024, unitCounter % 12, (i % 27) + 1)
        contractStart = moveIn.toISOString()
        const end = new Date(moveIn)
        end.setFullYear(end.getFullYear() + 1)
        contractEnd = end.toISOString()

        residents.push({
          id: residentId,
          name: residentName,
          email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
          phone: `+65 8${String(1000000 + unitCounter).slice(0, 7)}`,
          nationality: ['SG', 'JP', 'KR', 'TH', 'MY', 'PH'][unitCounter % 6]!,
          moveInDate: contractStart,
          unitId,
        })

        contracts.push({
          id: `ctr-${String(contractCounter).padStart(3, '0')}`,
          residentId,
          unitId,
          startDate: contractStart,
          endDate: contractEnd,
          status: status === 'reserved' ? 'pending' : 'active',
        })

        residentCounter += 1
        contractCounter += 1
      }

      units.push({
        id: unitId,
        propertyId: property.id,
        unitNumber,
        type,
        floor,
        status,
        resident: residentName,
        monthlyRate: 1200 + unitCounter * 35 + i * 50,
        contractStart,
        contractEnd,
      })

      unitCounter += 1
    }
  }

  return { units, residents, contracts }
}

const { units, residents, contracts } = buildUnitsAndResidents()

function withOccupancy(property: (typeof propertySeeds)[number]): Property {
  const propertyUnits = units.filter((u) => u.propertyId === property.id)
  const occupiedUnits = propertyUnits.filter(
    (u) => u.status === 'occupied',
  ).length
  const availableUnits = propertyUnits.filter(
    (u) => u.status === 'available',
  ).length
  const maintenanceUnits = propertyUnits.filter(
    (u) => u.status === 'maintenance',
  ).length

  return {
    ...property,
    totalUnits: propertyUnits.length,
    occupiedUnits,
    availableUnits,
    maintenanceUnits,
  }
}

export const db = {
  properties: propertySeeds.map(withOccupancy),
  units,
  residents,
  contracts,
  tickets: [] as Ticket[],
  users: [
    {
      id: 'user-001',
      name: 'Alex Morgan',
      role: 'Admin',
      email: 'alex.morgan@opshub.app',
    },
    {
      id: 'user-002',
      name: 'Priya Shah',
      role: 'Operations Manager',
      email: 'priya.shah@opshub.app',
    },
    {
      id: 'user-003',
      name: 'Chris Lee',
      role: 'Support Agent',
      email: 'chris.lee@opshub.app',
    },
    {
      id: 'user-004',
      name: 'Sam Rivera',
      role: 'Viewer',
      email: 'sam.rivera@opshub.app',
    },
  ] satisfies User[],
  activity: [] as ActivityItem[],
}

const ticketTitles = [
  'AC not cooling',
  'Leaking faucet',
  'Keycard not working',
  'Noise complaint',
  'Broken light fixture',
  'Wi-Fi intermittent',
  'Request cleaning visit',
  'Billing discrepancy',
  'Door lock jammed',
  'Water pressure low',
]

const categories = [
  'maintenance',
  'cleaning',
  'noise',
  'billing',
  'access',
  'other',
] as const
const priorities = ['low', 'medium', 'high', 'critical'] as const
const statuses = [
  'open',
  'in_progress',
  'waiting',
  'resolved',
  'closed',
] as const
const assignees = [
  'Priya Shah',
  'Chris Lee',
  'Aisha Rahman',
  'Kenji Sato',
  null,
]

function seedTickets() {
  const tickets: Ticket[] = []
  for (let i = 0; i < 42; i += 1) {
    const property = db.properties[i % db.properties.length]!
    const propertyUnits = db.units.filter((u) => u.propertyId === property.id)
    const unit = propertyUnits[i % Math.max(propertyUnits.length, 1)]
    const created = new Date(2025, i % 12, (i % 27) + 1, 9, 30)
    const updated = new Date(created)
    updated.setDate(updated.getDate() + (i % 5))

    tickets.push({
      id: `tkt-${String(i + 1).padStart(3, '0')}`,
      propertyId: property.id,
      unitId: unit?.id ?? null,
      title: ticketTitles[i % ticketTitles.length]!,
      description: `Reported issue at ${property.name}${unit ? ` unit ${unit.unitNumber}` : ''}. Please investigate and update the resident.`,
      category: categories[i % categories.length]!,
      priority: priorities[i % priorities.length]!,
      status: statuses[i % statuses.length]!,
      assignee: assignees[i % assignees.length] ?? null,
      createdAt: created.toISOString(),
      updatedAt: updated.toISOString(),
    })
  }
  return tickets
}

db.tickets = seedTickets()

db.activity = [
  ...db.tickets.slice(0, 8).map((ticket, index) => ({
    id: `act-t-${index}`,
    type: 'ticket' as const,
    message: `Ticket "${ticket.title}" marked ${ticket.status.replace('_', ' ')}`,
    timestamp: ticket.updatedAt,
    entityId: ticket.id,
  })),
  ...db.units
    .filter((u) => u.status === 'occupied')
    .slice(0, 4)
    .map((unit, index) => ({
      id: `act-u-${index}`,
      type: 'unit' as const,
      message: `Unit ${unit.unitNumber} occupied by ${unit.resident}`,
      timestamp: unit.contractStart ?? new Date().toISOString(),
      entityId: unit.id,
    })),
].sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
)

export function getOccupancyTrend(): OccupancyPoint[] {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return months.map((month, index) => ({
    month,
    occupancyRate: 72 + ((index * 3) % 18) + (index % 2),
  }))
}

export function recalculatePropertyOccupancy(propertyId: string) {
  const property = db.properties.find((p) => p.id === propertyId)
  if (!property) return
  const propertyUnits = db.units.filter((u) => u.propertyId === propertyId)
  property.totalUnits = propertyUnits.length
  property.occupiedUnits = propertyUnits.filter(
    (u) => u.status === 'occupied',
  ).length
  property.availableUnits = propertyUnits.filter(
    (u) => u.status === 'available',
  ).length
  property.maintenanceUnits = propertyUnits.filter(
    (u) => u.status === 'maintenance',
  ).length
}
