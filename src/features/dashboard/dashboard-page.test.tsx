import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { renderApp } from '@/test/test-utils'

describe('Dashboard', () => {
  it('renders KPI cards, charts, activity, and quick links', async () => {
    renderApp('/dashboard')

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('navigation', { name: 'Dashboard quick links' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /View properties/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /View tickets/i }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Occupancy rate')).toBeInTheDocument()
      expect(screen.getByText('Available units')).toBeInTheDocument()
      expect(screen.getByText('Maintenance units')).toBeInTheDocument()
      expect(screen.getByText('Open tickets')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Occupancy trend')).toBeInTheDocument()
      expect(screen.getByText('Tickets by priority')).toBeInTheDocument()
      expect(screen.getByText('Tickets by status')).toBeInTheDocument()
      expect(screen.getByText('Recent activity')).toBeInTheDocument()
    })

    expect(
      screen.getByLabelText('Key performance indicators'),
    ).toBeInTheDocument()
  })

  it('shows a recoverable error state when summary fails', async () => {
    server.use(
      http.get('/api/dashboard/summary', () =>
        HttpResponse.json({ message: 'Server unavailable' }, { status: 500 }),
      ),
    )

    renderApp('/dashboard')

    expect(await screen.findByText('Unable to load KPIs')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument()
  })
})
