import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { SessionProvider } from '@/features/settings/session-context'
import { router } from '@/app/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <RouterProvider router={router} />
        <Toaster
          richColors
          position="top-right"
          closeButton
          toastOptions={{
            classNames: {
              toast: 'border bg-card text-foreground shadow-md',
            },
          }}
        />
        {import.meta.env.DEV ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </SessionProvider>
    </QueryClientProvider>
  )
}
