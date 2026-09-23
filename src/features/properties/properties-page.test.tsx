import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/test-utils'

describe('Properties page', () => {
  it('filters properties by search', async () => {
    const user = userEvent.setup()
    renderApp('/properties')

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
  })

  it('filters properties by status', async () => {
    const user = userEvent.setup()
    renderApp('/properties')

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

    const table = screen.getByRole('table')
    expect(within(table).getByText('inactive')).toBeInTheDocument()
  })
})
