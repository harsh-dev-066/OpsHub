import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMemo } from 'react'
import { describe, expect, it } from 'vitest'
import {
  AuthProvider,
  useAuth,
  type AuthContextValue,
} from '@/features/auth/auth-context'
import { LoginPage } from '@/features/auth/login-page'
import { loginSearchSchema } from '@/features/auth/login-schema'
import {
  MOCK_CREDENTIALS,
  readAuthSession,
  verifyMockCredentials,
} from '@/features/auth/mock-auth'
import { SessionProvider } from '@/features/settings/session-context'

describe('mock auth credentials', () => {
  it('accepts test/test and rejects other pairs', () => {
    expect(
      verifyMockCredentials(
        MOCK_CREDENTIALS.username,
        MOCK_CREDENTIALS.password,
      ),
    ).toBe(true)
    expect(verifyMockCredentials('test', 'wrong')).toBe(false)
    expect(verifyMockCredentials('admin', 'test')).toBe(false)
  })
})

function isSignedIn(auth: AuthContextValue) {
  return auth.isAuthenticated || Boolean(readAuthSession())
}

function renderLogin(initial = '/login') {
  const rootRoute = createRootRouteWithContext<{ auth: AuthContextValue }>()({
    component: () => <Outlet />,
  })

  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    validateSearch: loginSearchSchema,
    component: LoginPage,
  })

  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    beforeLoad: ({ context }) => {
      if (!isSignedIn(context.auth)) {
        throw redirect({ to: '/login' })
      }
    },
    component: () => <h1>Dashboard</h1>,
  })

  const routeTree = rootRoute.addChildren([loginRoute, dashboardRoute])
  const history = createMemoryHistory({ initialEntries: [initial] })

  function Harness() {
    const auth = useAuth()
    const router = useMemo(
      () =>
        createRouter({
          routeTree,
          history,
          context: { auth: undefined! },
        }),
      [],
    )
    return <RouterProvider router={router} context={{ auth }} />
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionProvider>
          <Harness />
        </SessionProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('login screen', () => {
  it('signs in with test/test and stores the mock session', async () => {
    const user = userEvent.setup()
    renderLogin()

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('Username'), 'test')
    await user.type(screen.getByLabelText('Password'), 'test')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(readAuthSession()?.username).toBe('test')
    })
  })

  it('shows an error for invalid credentials', async () => {
    const user = userEvent.setup()
    renderLogin()

    await screen.findByRole('heading', { name: 'Sign in' })
    await user.type(screen.getByLabelText('Username'), 'test')
    await user.type(screen.getByLabelText('Password'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText(/Invalid username or password/i),
    ).toBeInTheDocument()
    expect(readAuthSession()).toBeNull()
  })
})
