import { Link } from '@tanstack/react-router'
import { ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { USE_MOCK_API } from '@/lib/env'

export function CtaSection() {
  return (
    <section aria-labelledby="cta-heading" className="px-4 py-20 sm:px-6">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-lg sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary-foreground)/0.18),transparent_55%)]"
        />
        <div className="relative">
          <h2
            id="cta-heading"
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            See it with real data
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/85">
            Sign in as an Admin, Operations Manager, Support Agent or Viewer.
            The demo accounts are listed on the sign-in page.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 gap-2 bg-card text-foreground hover:bg-card/90"
          >
            <Link to="/login">
              Open the console
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          {USE_MOCK_API ? null : (
            <p className="mx-auto mt-6 flex max-w-lg items-center justify-center gap-2 text-xs text-primary-foreground/75">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Free hosting: the first request can take up to a minute.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
