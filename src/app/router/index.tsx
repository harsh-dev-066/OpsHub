import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { z } from 'zod'
import { AppLayout } from '@/app/layouts/AppLayout'
import type { AuthContextValue } from '@/features/auth/auth-context'
import { readAuthSession } from '@/features/auth/mock-auth'
import { loginSearchSchema } from '@/features/auth/login-schema'
import { NotFoundPage } from '@/features/settings/not-found-page'
import { Skeleton } from '@/components/ui/skeleton'
import { propertiesSearchSchema } from '@/features/properties/properties-search'
import { ticketsSearchSchema } from '@/features/tickets/ticket-schema'

export interface RouterContext {
  auth: AuthContextValue
}

function isSignedIn(auth: AuthContextValue) {
  return auth.isAuthenticated || Boolean(readAuthSession())
}

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
const LoginPage = lazy(() =>
  import('@/features/auth/login-page').then((m) => ({
    default: m.LoginPage,
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

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
  beforeLoad: ({ context, location }) => {
    const isPublicLogin = location.pathname === '/login'
    if (!isPublicLogin && !isSignedIn(context.auth)) {
      throw redirect({
        to: '/login',
        search: {
          redirect: `${location.pathname}${location.searchStr}`,
        },
      })
    }
  },
  notFoundComponent: NotFoundPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context }) => {
    if (isSignedIn(context.auth)) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: () => (
    <LazyPage>
      <LoginPage />
    </LazyPage>
  ),
})

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: ({ context, location }) => {
    if (!isSignedIn(context.auth)) {
      throw redirect({
        to: '/login',
        search: {
          redirect: `${location.pathname}${location.searchStr}`,
        },
      })
    }
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
  notFoundComponent: NotFoundPage,
})

const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' })
  },
})

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: () => (
    <LazyPage>
      <DashboardPage />
    </LazyPage>
  ),
})

const propertiesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/properties',
  validateSearch: propertiesSearchSchema,
  component: () => (
    <LazyPage>
      <PropertiesPage />
    </LazyPage>
  ),
})

const propertyDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
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
  getParentRoute: () => authenticatedRoute,
  path: '/units',
  validateSearch: unitsSearchSchema,
  component: () => (
    <LazyPage>
      <UnitsPage />
    </LazyPage>
  ),
})

const unitDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/units/$unitId',
  component: () => (
    <LazyPage>
      <UnitDetailPage />
    </LazyPage>
  ),
})

const ticketsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/tickets',
  validateSearch: ticketsSearchSchema,
  component: () => (
    <LazyPage>
      <TicketsPage />
    </LazyPage>
  ),
})

const ticketDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/tickets/$ticketId',
  component: () => (
    <LazyPage>
      <TicketDetailPage />
    </LazyPage>
  ),
})

const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/settings',
  component: () => (
    <LazyPage>
      <SettingsPage />
    </LazyPage>
  ),
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    indexRoute,
    dashboardRoute,
    propertiesRoute,
    propertyDetailRoute,
    unitsRoute,
    unitDetailRoute,
    ticketsRoute,
    ticketDetailRoute,
    settingsRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    auth: undefined!,
  },
  defaultNotFoundComponent: NotFoundPage,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
