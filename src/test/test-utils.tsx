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
import { AuthProvider } from '@/features/auth/auth-context'
import { writeAuthSession } from '@/features/auth/mock-auth'
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
import { UsersPage } from '@/features/users/users-page'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

/** Seed a mock authenticated session for private-route tests. */
export function seedAuthenticatedSession(username = 'test') {
  writeAuthSession({
    username,
    authenticatedAt: new Date().toISOString(),
  })
}

export function renderApp(route = '/dashboard', username = 'test') {
  seedAuthenticatedSession(username)
  const queryClient = createTestQueryClient()

  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  })

  const authenticatedRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'authenticated',
    component: () => (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
  })

  const dashboardRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/dashboard',
    component: DashboardPage,
  })
  const propertiesRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/properties',
    validateSearch: propertiesSearchSchema,
    component: PropertiesPage,
  })
  const propertyDetailRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/properties/$propertyId',
    component: PropertyDetailPage,
  })
  const unitsRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/units',
    validateSearch: z.object({ propertyId: z.string().optional() }),
    component: UnitsPage,
  })
  const unitDetailRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/units/$unitId',
    component: UnitDetailPage,
  })
  const ticketsRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/tickets',
    validateSearch: ticketsSearchSchema,
    component: TicketsPage,
  })
  const ticketDetailRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/tickets/$ticketId',
    component: TicketDetailPage,
  })
  const settingsRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/settings',
    component: SettingsPage,
  })
  const usersRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/users',
    component: UsersPage,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([
      authenticatedRoute.addChildren([
        dashboardRoute,
        propertiesRoute,
        propertyDetailRoute,
        unitsRoute,
        unitDetailRoute,
        ticketsRoute,
        ticketDetailRoute,
        usersRoute,
        settingsRoute,
      ]),
    ]),
    history: createMemoryHistory({ initialEntries: [route] }),
  })

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SessionProvider>
            <RouterProvider router={router} />
            <Toaster />
          </SessionProvider>
        </AuthProvider>
      </QueryClientProvider>,
    ),
    queryClient,
    router,
  }
}
