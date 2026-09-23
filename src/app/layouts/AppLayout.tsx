import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { Building, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getVisibleNavItems } from '@/components/navigation/nav-items'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth/auth-context'
import { usePermissions } from '@/features/auth/permissions'
import { useSession } from '@/features/settings/session-context'
import { cn } from '@/lib/utils'

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
        aria-hidden
      >
        <Building className="h-4 w-4" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight">OpsHub</p>
        <p className="text-xs text-muted-foreground">Property Operations</p>
      </div>
    </div>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

function NavLinks({
  onNavigate,
  firstLinkRef,
}: {
  onNavigate?: () => void
  firstLinkRef?: React.RefObject<HTMLAnchorElement | null>
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { hasPermission } = usePermissions()

  const visibleItems = useMemo(
    () => getVisibleNavItems(hasPermission),
    [hasPermission],
  )

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Primary">
      {visibleItems.map((item, index) => {
        const Icon = item.icon
        const active =
          pathname === item.to || pathname.startsWith(`${item.to}/`)
        return (
          <Link
            key={item.to}
            ref={index === 0 ? firstLinkRef : undefined}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              className={cn(
                'h-4 w-4 transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground/80 group-hover:text-foreground',
              )}
              aria-hidden
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSession()
  const { logout, session } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const firstNavLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!mobileOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const menuButton = menuButtonRef.current

    const frame = window.requestAnimationFrame(() => {
      firstNavLinkRef.current?.focus()
    })

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKeyDown)
      menuButton?.focus()
    }
  }, [mobileOpen])

  function handleLogout() {
    logout()
    toast.message('Signed out')
    void navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow-md"
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen">
        <aside className="hidden w-(--sidebar-width) shrink-0 border-r bg-card md:flex md:flex-col">
          <div className="flex h-(--header-height) items-center border-b px-5">
            <Brand />
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
              Workspace
            </p>
            <NavLinks />
          </div>
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className="relative z-50 flex h-full w-(--sidebar-width) flex-col border-r bg-card shadow-lg"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <div className="flex h-(--header-height) items-center justify-between px-5">
                <Brand />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Separator />
              <div className="overflow-y-auto p-3">
                <NavLinks
                  onNavigate={() => setMobileOpen(false)}
                  firstLinkRef={firstNavLinkRef}
                />
              </div>
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-(--header-height) items-center justify-between gap-3 border-b bg-card/80 px-4 backdrop-blur-md md:px-8">
            <div className="flex items-center gap-2">
              <Button
                ref={menuButtonRef}
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
                aria-expanded={mobileOpen}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <p className="text-sm font-semibold md:hidden">OpsHub</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground ring-1 ring-primary/10"
                aria-hidden
              >
                {initials(user.name)}
              </span>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight">{user.name}</p>
                <p className="text-xs leading-tight text-muted-foreground">
                  {user.role}
                  {session?.username ? ` · ${session.username}` : null}
                </p>
              </div>
              <Separator orientation="vertical" className="mx-1 h-6!" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Sign out"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </header>
          <main id="main-content" className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
