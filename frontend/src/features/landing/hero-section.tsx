import { Link } from '@tanstack/react-router'
import { ArrowRight, Database, ShieldCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DEMO_STATS } from '@/features/landing/landing-content'
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.14),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-size-[48px_48px] opacity-40 mask-[radial-gradient(ellipse_at_top,black_20%,transparent_70%)] bg-[linear-gradient(hsl(var(--border)/0.8)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.8)_1px,transparent_1px)]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:pb-24">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            Full-stack portfolio project · React + Django
          </span>

          <h1
            id="hero-heading"
            className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl"
          >
            Run a property portfolio from{' '}
            <span className="text-primary">one console</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            OpsHub brings properties, units, residents and maintenance tickets
            into a single operations dashboard, with role-based access enforced
            by a real API. Every number on screen comes from PostgreSQL.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/login">
                Try the live demo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#features">Explore features</a>
            </Button>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" aria-hidden />
              Demo account for every role
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              No sign-up needed
            </li>
            <li className="flex items-center gap-1.5">
              <Database className="h-4 w-4 text-primary" aria-hidden />
              Fictional sample data
            </li>
          </ul>
        </div>

        <ProductPreview />
      </div>

      <div className="relative border-y bg-card/70 backdrop-blur-sm">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:grid-cols-4 sm:divide-x sm:divide-border sm:px-6">
          {DEMO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-0.5 py-5"
            >
              <dt className="order-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="order-1 text-2xl font-semibold tabular-nums text-foreground">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="sr-only">Figures describe the seeded demo dataset.</p>
      </div>
    </section>
  )
}
