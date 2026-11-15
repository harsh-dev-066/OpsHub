import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getVisibleNavItems } from '@/components/navigation/nav-items'
import { can, hasPermission } from '@/lib/permissions'
import { renderApp } from '@/test/test-utils'

describe('permission-based UI rendering', () => {
  it('filters navigation by permission instead of role strings', () => {
    const viewerNav = getVisibleNavItems((permission) =>
      hasPermission('Viewer', permission),
    )
    expect(viewerNav.map((item) => item.to)).toEqual([
      '/dashboard',
      '/properties',
      '/units',
      '/tickets',
      '/users',
      '/settings',
    ])

    const withoutTickets = getVisibleNavItems(
      (permission) => permission !== 'tickets:read' && can('Admin', permission),
    )
    expect(withoutTickets.map((item) => item.label)).not.toContain('Tickets')
    expect(withoutTickets.map((item) => item.label)).toContain('Properties')
    expect(withoutTickets.map((item) => item.label)).toContain('Users')
  })

  it('hides ticket create for Viewer', async () => {
    renderApp('/tickets', 'sam')

    expect(
      await screen.findByRole('heading', { name: 'Tickets' }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Create ticket' }),
      ).not.toBeInTheDocument()
    })
  })

  it('shows ticket create for Operations Manager', async () => {
    renderApp('/tickets', 'priya')

    expect(
      await screen.findByRole('button', { name: 'Create ticket' }),
    ).toBeInTheDocument()
  })

  it('hides ticket edit and status controls for Viewer', async () => {
    renderApp('/tickets/tkt-001', 'sam')

    expect(
      await screen.findByRole('heading', { name: /AC not cooling|Ticket/i }),
    ).toBeInTheDocument()

    expect(
      await screen.findByText(
        /Your current role can view tickets but cannot change status/i,
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Edit ticket' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('Update ticket status'),
    ).not.toBeInTheDocument()
  })

  it('shows add user for admin operator and hides it for viewers', async () => {
    const viewerView = renderApp('/users', 'sam')

    expect(
      await screen.findByRole('heading', { name: 'User Management' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Add user' }),
    ).not.toBeInTheDocument()
    viewerView.unmount()

    renderApp('/users', 'test')

    expect(
      await screen.findByRole('button', { name: 'Add user' }),
    ).toBeInTheDocument()
  })

  it('keeps settings role read-only', async () => {
    renderApp('/settings', 'test')

    expect(
      await screen.findByRole('heading', { name: 'Settings' }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Select role')).not.toBeInTheDocument()
    expect(screen.getByText(/cannot be changed here/i)).toBeInTheDocument()
  })
})
