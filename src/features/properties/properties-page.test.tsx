import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/test-utils'

describe('Properties page', () => {
  it('filters properties by search and syncs the URL', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/properties')

    expect(
      await screen.findByRole('heading', { name: 'Properties' }),
    ).toBeInTheDocument()

    await screen.findByText('Harbor View Residences')

    const search = screen.getByLabelText('Search properties')
    await user.clear(search)
    await user.type(search, 'Cedar Lane')

    await waitFor(() => {
      expect(screen.getByText('Cedar Lane Collective')).toBeInTheDocument()
      expect(
        screen.queryByText('Harbor View Residences'),
      ).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(router.state.location.search.search).toBe('Cedar Lane')
    })
  })

  it('filters properties by status via URL-backed controls', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/properties')

    await screen.findByText('Harbor View Residences')

    const statusTrigger = screen.getByLabelText('Filter by status')
    await user.click(statusTrigger)

    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('Inactive'))

    await waitFor(() => {
      expect(screen.getByText('Oakwood Commons')).toBeInTheDocument()
      expect(
        screen.queryByText('Harbor View Residences'),
      ).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(router.state.location.search.status).toBe('inactive')
    })

    const table = screen.getByRole('table')
    expect(within(table).getByText('inactive')).toBeInTheDocument()
    expect(within(table).getByRole('link', { name: 'View' })).toBeInTheDocument()
  })

  it('hydrates filters from URL search params', async () => {
    renderApp('/properties?status=inactive&search=Oakwood')

    expect(
      await screen.findByRole('heading', { name: 'Properties' }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Oakwood Commons')).toBeInTheDocument()
      expect(
        screen.queryByText('Harbor View Residences'),
      ).not.toBeInTheDocument()
    })
  })

  it('renders property detail summary and tabs', async () => {
    renderApp('/properties/prop-001')

    expect(
      await screen.findByRole('heading', { name: 'Harbor View Residences' }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Property summary')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Units' })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Recent tickets' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Activity' })).toBeInTheDocument()
  })
})
