import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers/AppProviders'
import '@/theme/index.css'

async function enableMocking() {
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
