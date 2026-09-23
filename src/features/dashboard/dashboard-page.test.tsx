import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '@/test/test-utils'

describe('Dashboard', () => {
  it('renders KPI cards from the API', async () => {
    renderApp('/dashboard')

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Occupancy rate')).toBeInTheDocument()
      expect(screen.getByText('Available units')).toBeInTheDocument()
      expect(screen.getByText('Maintenance units')).toBeInTheDocument()
      expect(screen.getByText('Open tickets')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Occupancy trend')).toBeInTheDocument()
      expect(screen.getByText('Recent activity')).toBeInTheDocument()
    })
  })
})
