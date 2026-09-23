import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { router } from '@/app/router'
import { AuthProvider, useAuth } from '@/features/auth/auth-context'
import { SessionProvider } from '@/features/settings/session-context'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AuthenticatedRouter() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionProvider>
          <AuthenticatedRouter />
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
          {import.meta.env.DEV &&
          import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS !== 'false' ? (
            <ReactQueryDevtools initialIsOpen={false} />
          ) : null}
        </SessionProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
