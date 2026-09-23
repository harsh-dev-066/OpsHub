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
import type { ReactElement, ReactNode } from 'react'
import { Toaster } from 'sonner'
import { AppLayout } from '@/app/layouts/AppLayout'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { PropertiesPage } from '@/features/properties/properties-page'
import { TicketsPage } from '@/features/tickets/tickets-page'
import { TicketDetailPage } from '@/features/tickets/ticket-detail-page'
import { SettingsPage } from '@/features/settings/settings-page'
import { SessionProvider } from '@/features/settings/session-context'
import { z } from 'zod'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function renderWithProviders(
  ui: ReactElement,
  options?: { route?: string },
) {
  const queryClient = createTestQueryClient()
  const initialPath = options?.route ?? '/dashboard'

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
    component: PropertiesPage,
  })
  const ticketsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/tickets',
    validateSearch: z.object({ propertyId: z.string().optional() }),
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
  const catchAllRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$',
    component: () => ui,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([
      dashboardRoute,
      propertiesRoute,
      ticketsRoute,
      ticketDetailRoute,
      settingsRoute,
      catchAllRoute,
    ]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  function Wrapper({ children: _children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <RouterProvider router={router} />
          <Toaster />
        </SessionProvider>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper }),
    queryClient,
    router,
  }
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
    component: PropertiesPage,
  })
  const ticketsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/tickets',
    validateSearch: z.object({ propertyId: z.string().optional() }),
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
