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
  it('presents the product and links every sign-in CTA to /login', async () => {
    renderLanding()

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /run a property portfolio from one console/i,
      }),
    ).toBeInTheDocument()

    const ctas = [
      screen.getByRole('link', { name: 'Sign in' }),
      screen.getByRole('link', { name: /try the live demo/i }),
      screen.getByRole('link', { name: /open the console/i }),
    ]
    for (const cta of ctas) {
      expect(cta).toHaveAttribute('href', '/login')
    }
  })

  it('renders each informational section with in-page navigation', async () => {
    renderLanding()

    for (const name of [
      /everything an operations team touches daily/i,
      /four roles, enforced end to end/i,
      /a real three-tier stack/i,
      /built with production-grade tools/i,
    ]) {
      expect(
        await screen.findByRole('heading', { level: 2, name }),
      ).toBeInTheDocument()
    }

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).getByRole('link', { name: 'Roles' })).toHaveAttribute(
      'href',
      '#roles',
    )
  })

  it('derives the permission matrix from the real role map', async () => {
    renderLanding()

    const table = await screen.findByRole('table', {
      name: /permissions granted to each role/i,
    })

    const manageUsers = within(table).getByRole('row', {
      name: /manage users & roles/i,
    })
    const cells = within(manageUsers).getAllByRole('cell')
    // Column order: Admin, Operations Manager, Support Agent, Viewer.
    expect(within(cells[0]!).getByLabelText('Allowed')).toBeInTheDocument()
    expect(within(cells[3]!).getByLabelText('Not allowed')).toBeInTheDocument()

    const viewTickets = within(table).getByRole('row', {
      name: /view tickets/i,
    })
    expect(within(viewTickets).getAllByLabelText('Allowed')).toHaveLength(4)
  })
})
