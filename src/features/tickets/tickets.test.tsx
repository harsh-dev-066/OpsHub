import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { SessionProvider } from '@/features/settings/session-context'
import { TicketForm } from '@/features/tickets/ticket-form'
import { server } from '@/mocks/server'
import { renderApp } from '@/test/test-utils'

describe('Ticket form validation', () => {
  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <TicketForm onSubmit={async () => undefined} />
        </SessionProvider>
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Create ticket' }))

    expect(
      await screen.findByText('Title must be at least 3 characters'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Description must be at least 10 characters'),
    ).toBeInTheDocument()
    expect(screen.getByText('Property is required')).toBeInTheDocument()
  })

  it('rejects titles that are too short after trim', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <TicketForm onSubmit={async () => undefined} />
        </SessionProvider>
      </QueryClientProvider>,
    )

    await user.type(screen.getByLabelText('Title'), 'ab')
    await user.type(screen.getByLabelText('Description'), 'Short')
    await user.click(screen.getByRole('button', { name: 'Create ticket' }))

    expect(
      await screen.findByText('Title must be at least 3 characters'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Description must be at least 10 characters'),
    ).toBeInTheDocument()
  })
})

describe('Ticket creation flow', () => {
  it('creates a ticket successfully and closes the dialog', async () => {
    const user = userEvent.setup()
    renderApp('/tickets')

    expect(
      await screen.findByRole('heading', { name: 'Tickets' }),
    ).toBeInTheDocument()

    await user.click(
      await screen.findByRole('button', { name: 'Create ticket' }),
    )
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Title'), 'Broken thermostat')
    await user.type(
      screen.getByLabelText('Description'),
      'Temperature control is not responding in the unit.',
    )

    await user.click(screen.getByLabelText('Property'))
    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('Harbor View Residences'))

    await user.click(screen.getByRole('button', { name: 'Create ticket' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Broken thermostat')).toBeInTheDocument()
    })

    expect(await screen.findByText('Ticket created')).toBeInTheDocument()
  })

  it('keeps the dialog open and shows an error toast when creation fails', async () => {
    server.use(
      http.post('/api/tickets', () =>
        HttpResponse.json(
          { message: 'Unable to create ticket right now. Please try again.' },
          { status: 500 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderApp('/tickets')

    await user.click(
      await screen.findByRole('button', { name: 'Create ticket' }),
    )

    await user.type(screen.getByLabelText('Title'), 'Network failure case')
    await user.type(
      screen.getByLabelText('Description'),
      'This create request should fail intentionally.',
    )
    await user.click(screen.getByLabelText('Property'))
    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('Harbor View Residences'))

    await user.click(screen.getByRole('button', { name: 'Create ticket' }))

    expect(
      await screen.findByText(
        'Unable to create ticket right now. Please try again.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.queryByText('Network failure case')).not.toBeInTheDocument()
  })
})

describe('Ticket status update', () => {
  it('updates ticket status with optimistic UI', async () => {
    const user = userEvent.setup()
    renderApp('/tickets/tkt-001')

    expect(
      await screen.findByRole('heading', { name: /AC not cooling|Ticket/i }),
    ).toBeInTheDocument()

    const statusTrigger = await screen.findByLabelText('Update ticket status')
    await user.click(statusTrigger)
    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('resolved'))

    await waitFor(() => {
      expect(screen.getAllByText('resolved').length).toBeGreaterThan(0)
    })

    expect(await screen.findByText('Status updated')).toBeInTheDocument()
  })
})
