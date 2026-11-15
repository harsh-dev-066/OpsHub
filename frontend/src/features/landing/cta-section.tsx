import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section aria-labelledby="cta-heading" className="px-4 pb-24 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-2xl bg-primary px-8 py-10 text-primary-foreground sm:flex-row sm:items-center sm:px-10">
        <div>
          <h2
            id="cta-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Ready to take a look?
          </h2>
          <p className="mt-2 text-primary-foreground/80">
            Sign in to explore the console.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="gap-2 bg-card text-foreground hover:bg-card/90"
        >
          <Link to="/login">
            Sign in
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  )
}
