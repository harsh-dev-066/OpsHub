import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LandingPage } from '@/features/landing/landing-page'

function renderLanding() {
  const rootRoute = createRootRoute({ component: () => <Outlet /> })
  const routeTree = rootRoute.addChildren([
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: LandingPage,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/login',
      component: () => <h1>Sign in</h1>,
    }),
  ])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  return render(<RouterProvider router={router} />)
}

describe('landing page', () => {
  it('introduces the product and sends every sign-in link to /login', async () => {
    renderLanding()

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /property operations, in one place/i,
      }),
    ).toBeInTheDocument()

    const signInLinks = screen.getAllByRole('link', { name: /sign in/i })
    expect(signInLinks).toHaveLength(3)
    for (const link of signInLinks) {
      expect(link).toHaveAttribute('href', '/login')
    }
  })

  it('covers features, workflow and roles with in-page navigation', async () => {
    renderLanding()

    for (const name of [
      /built for the people running the buildings/i,
      /from issue to resolved/i,
      /the right access for every role/i,
    ]) {
      expect(
        await screen.findByRole('heading', { level: 2, name }),
      ).toBeInTheDocument()
    }

    for (const role of [
      'Admin',
      'Operations Manager',
      'Support Agent',
      'Viewer',
    ]) {
      expect(
        screen.getByRole('heading', { level: 3, name: role }),
      ).toBeInTheDocument()
    }

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).getByRole('link', { name: 'Roles' })).toHaveAttribute(
      'href',
      '#roles',
    )
  })
})
