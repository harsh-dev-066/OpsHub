import { Check } from 'lucide-react'
import { FEATURES } from '@/features/landing/landing-content'
import { SectionHeading } from '@/features/landing/section-heading'

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="features-heading"
          eyebrow="Features"
          title="Everything an operations team touches daily"
          description="From the portfolio overview down to a single leaking faucet, each screen is backed by real, paginated and permission-checked API endpoints."
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, points }) => (
            <li
              key={title}
              className="group flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-shadow motion-safe:transition-transform hover:shadow-md motion-safe:hover:-translate-y-0.5"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground"
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              <ul className="mt-4 space-y-2 border-t pt-4">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-success-foreground"
                      aria-hidden
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
