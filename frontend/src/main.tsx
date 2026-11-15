import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers/AppProviders'
import { API_BASE_URL, USE_MOCK_API } from '@/lib/env'
import '@/theme/index.css'

async function enableMocking() {
  // Only offline mock mode uses MSW; otherwise /api hits Django.
  if (!USE_MOCK_API) return
  const { worker } = await import('@/mocks/browser')
  return worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })
}

// Wake a scaled-to-zero API while the user is still on the login screen.
if (!USE_MOCK_API) {
  void fetch(`${API_BASE_URL}/api/health`).catch(() => undefined)
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  )
})
