import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
      '/settings',
    ])

    const withoutTickets = getVisibleNavItems(
      (permission) => permission !== 'tickets:read' && can('Admin', permission),
    )
    expect(withoutTickets.map((item) => item.label)).not.toContain('Tickets')
    expect(withoutTickets.map((item) => item.label)).toContain('Properties')
  })

  it('hides ticket create for Viewer', async () => {
    localStorage.setItem('opshub.role', 'Viewer')
    renderApp('/tickets')

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
    localStorage.setItem('opshub.role', 'Operations Manager')
    renderApp('/tickets')

    expect(
      await screen.findByRole('button', { name: 'Create ticket' }),
    ).toBeInTheDocument()
  })

  it('hides ticket edit and status controls for Viewer', async () => {
    localStorage.setItem('opshub.role', 'Viewer')
    renderApp('/tickets/tkt-001')

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

  it('updates effective permissions when the role changes', async () => {
    localStorage.setItem('opshub.role', 'Viewer')
    const user = userEvent.setup()
    renderApp('/settings')

    expect(
      await screen.findByRole('heading', { name: 'Settings' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('tickets:create')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('Select role'))
    await user.click(
      await screen.findByRole('option', { name: 'Operations Manager' }),
    )

    await waitFor(() => {
      expect(screen.getByText('tickets:create')).toBeInTheDocument()
      expect(screen.getByText('properties:write')).toBeInTheDocument()
    })
  })
})
