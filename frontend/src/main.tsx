import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers/AppProviders'
import { USE_MOCK_API } from '@/lib/env'
import '@/theme/index.css'

async function enableMocking() {
  // Only the static demo / offline dev uses MSW; otherwise /api hits Django.
  if (!USE_MOCK_API) return
  const { worker } = await import('@/mocks/browser')
  return worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })
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
