import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getVisibleNavItems } from '@/components/navigation/nav-items'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePermissions } from '@/features/auth/permissions'
import { useSession } from '@/features/settings/session-context'
import { cn } from '@/lib/utils'

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
    <nav className="flex flex-col gap-1" aria-label="Primary">
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
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSession()
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
          <div className="px-4 py-5">
            <p className="text-lg font-semibold tracking-tight">OpsHub</p>
            <p className="text-xs text-muted-foreground">
              Property Operations Console
            </p>
          </div>
          <Separator />
          <div className="flex-1 overflow-y-auto p-3">
            <NavLinks />
          </div>
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className="relative z-50 flex h-full w-(--sidebar-width) flex-col border-r bg-card shadow-lg"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <div className="flex items-center justify-between px-4 py-4">
                <p className="text-lg font-semibold">OpsHub</p>
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
          <header className="sticky top-0 z-30 flex h-(--header-height) items-center justify-between gap-3 border-b bg-card/95 px-4 backdrop-blur">
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
              <p className="text-sm text-muted-foreground md:hidden">OpsHub</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </header>
          <main id="main-content" className="flex-1 px-4 py-6 md:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
