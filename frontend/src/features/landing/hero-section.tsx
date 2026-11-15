import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductPreview } from '@/features/landing/product-preview'

export function HeroSection() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10),transparent_65%)]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:pb-28">
        <div className="flex flex-col items-start gap-6">
          <h1
            id="hero-heading"
            className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl"
          >
            Property operations, in one place.
          </h1>

          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            Track occupancy, manage units and residents, and keep maintenance
            moving, with access that fits each person on your team.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/login">
                Sign in
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href="#features">See what it does</a>
            </Button>
          </div>
        </div>

        <ProductPreview />
      </div>
    </section>
  )
}
