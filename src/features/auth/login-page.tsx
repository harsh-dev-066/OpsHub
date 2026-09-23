import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/auth-context'
import {
  loginFormSchema,
  type LoginFormValues,
} from '@/features/auth/login-schema'
import { MOCK_CREDENTIALS } from '@/features/auth/mock-auth'
import {
  describedByIds,
  FormField,
} from '@/features/tickets/form-field'

const loginRoute = getRouteApi('/login')

function safeInternalPath(redirect: string | undefined) {
  if (!redirect) return '/dashboard'
  if (!redirect.startsWith('/') || redirect.startsWith('//')) {
    return '/dashboard'
  }
  if (redirect === '/login' || redirect.startsWith('/login?')) {
    return '/dashboard'
  }
  return redirect
}

export function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const { redirect } = loginRoute.useSearch()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const errors = form.formState.errors
  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)
    try {
      await login(values.username, values.password)
      toast.success('Signed in')
      await router.navigate({ to: safeInternalPath(redirect) })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to sign in.'
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-2xl font-semibold tracking-tight">OpsHub</p>
          <h1 className="text-lg font-medium">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the property operations console.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <FormField
              id="username"
              label="Username"
              error={errors.username?.message}
            >
              <Input
                id="username"
                autoComplete="username"
                autoFocus
                placeholder={MOCK_CREDENTIALS.username}
                {...form.register('username')}
                aria-invalid={!!errors.username}
                aria-describedby={describedByIds('username', !!errors.username)}
              />
            </FormField>

            <FormField
              id="password"
              label="Password"
              error={errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...form.register('password')}
                aria-invalid={!!errors.password}
                aria-describedby={describedByIds('password', !!errors.password)}
              />
            </FormField>

            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
