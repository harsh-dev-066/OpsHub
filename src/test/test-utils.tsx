import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { Toaster } from 'sonner'
import { z } from 'zod'
import { AppLayout } from '@/app/layouts/AppLayout'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { PropertiesPage } from '@/features/properties/properties-page'
import { propertiesSearchSchema } from '@/features/properties/properties-search'
import { PropertyDetailPage } from '@/features/properties/property-detail-page'
import { TicketsPage } from '@/features/tickets/tickets-page'
import { ticketsSearchSchema } from '@/features/tickets/ticket-schema'
import { TicketDetailPage } from '@/features/tickets/ticket-detail-page'
import { SettingsPage } from '@/features/settings/settings-page'
import { SessionProvider } from '@/features/settings/session-context'
import { UnitsPage } from '@/features/units/units-page'
import { UnitDetailPage } from '@/features/units/unit-detail-page'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function renderApp(route = '/dashboard') {
  const queryClient = createTestQueryClient()

  const rootRoute = createRootRoute({
    component: () => (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
  })

  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: DashboardPage,
  })
  const propertiesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/properties',
    validateSearch: propertiesSearchSchema,
    component: PropertiesPage,
  })
  const propertyDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/properties/$propertyId',
    component: PropertyDetailPage,
  })
  const unitsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/units',
    validateSearch: z.object({ propertyId: z.string().optional() }),
    component: UnitsPage,
  })
  const unitDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/units/$unitId',
    component: UnitDetailPage,
  })
  const ticketsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/tickets',
    validateSearch: ticketsSearchSchema,
    component: TicketsPage,
  })
  const ticketDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/tickets/$ticketId',
    component: TicketDetailPage,
  })
  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings',
    component: SettingsPage,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([
      dashboardRoute,
      propertiesRoute,
      propertyDetailRoute,
      unitsRoute,
      unitDetailRoute,
      ticketsRoute,
      ticketDetailRoute,
      settingsRoute,
    ]),
    history: createMemoryHistory({ initialEntries: [route] }),
  })

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <RouterProvider router={router} />
          <Toaster />
        </SessionProvider>
      </QueryClientProvider>,
    ),
    queryClient,
    router,
  }
}
