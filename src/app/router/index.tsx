import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { z } from 'zod'
import { AppLayout } from '@/app/layouts/AppLayout'
import { NotFoundPage } from '@/features/settings/not-found-page'
import { Skeleton } from '@/components/ui/skeleton'
import { propertiesSearchSchema } from '@/features/properties/properties-search'
import { ticketsSearchSchema } from '@/features/tickets/ticket-schema'

const DashboardPage = lazy(() =>
  import('@/features/dashboard/dashboard-page').then((m) => ({
    default: m.DashboardPage,
  })),
)
const PropertiesPage = lazy(() =>
  import('@/features/properties/properties-page').then((m) => ({
    default: m.PropertiesPage,
  })),
)
const PropertyDetailPage = lazy(() =>
  import('@/features/properties/property-detail-page').then((m) => ({
    default: m.PropertyDetailPage,
  })),
)
const UnitsPage = lazy(() =>
  import('@/features/units/units-page').then((m) => ({
    default: m.UnitsPage,
  })),
)
const UnitDetailPage = lazy(() =>
  import('@/features/units/unit-detail-page').then((m) => ({
    default: m.UnitDetailPage,
  })),
)
const TicketsPage = lazy(() =>
  import('@/features/tickets/tickets-page').then((m) => ({
    default: m.TicketsPage,
  })),
)
const TicketDetailPage = lazy(() =>
  import('@/features/tickets/ticket-detail-page').then((m) => ({
    default: m.TicketDetailPage,
  })),
)
const SettingsPage = lazy(() =>
  import('@/features/settings/settings-page').then((m) => ({
    default: m.SettingsPage,
  })),
)

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
  notFoundComponent: NotFoundPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' })
  },
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <LazyPage>
      <DashboardPage />
    </LazyPage>
  ),
})

const propertiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/properties',
  validateSearch: propertiesSearchSchema,
  component: () => (
    <LazyPage>
      <PropertiesPage />
    </LazyPage>
  ),
})

const propertyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/properties/$propertyId',
  component: () => (
    <LazyPage>
      <PropertyDetailPage />
    </LazyPage>
  ),
})

const unitsSearchSchema = z.object({
  propertyId: z.string().optional(),
})

const unitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/units',
  validateSearch: unitsSearchSchema,
  component: () => (
    <LazyPage>
      <UnitsPage />
    </LazyPage>
  ),
})

const unitDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/units/$unitId',
  component: () => (
    <LazyPage>
      <UnitDetailPage />
    </LazyPage>
  ),
})

const ticketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tickets',
  validateSearch: ticketsSearchSchema,
  component: () => (
    <LazyPage>
      <TicketsPage />
    </LazyPage>
  ),
})

const ticketDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tickets/$ticketId',
  component: () => (
    <LazyPage>
      <TicketDetailPage />
    </LazyPage>
  ),
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <LazyPage>
      <SettingsPage />
    </LazyPage>
  ),
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  propertiesRoute,
  propertyDetailRoute,
  unitsRoute,
  unitDetailRoute,
  ticketsRoute,
  ticketDetailRoute,
  settingsRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFoundPage,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
