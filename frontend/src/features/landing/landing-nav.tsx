import { Link } from '@tanstack/react-router'
import { Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NAV_LINKS } from '@/features/landing/landing-content'

export function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <a
          href="#top"
          className="flex items-center gap-2.5 rounded-md font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
            aria-hidden
          >
            <Building className="h-4 w-4" />
          </span>
          OpsHub
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <Button asChild size="sm">
          <Link to="/login">Sign in</Link>
        </Button>
      </nav>
    </header>
  )
}
