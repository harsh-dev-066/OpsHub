import { ArrowDown, ArrowRight } from 'lucide-react'
import { Fragment } from 'react'
import {
  ARCHITECTURE,
  ENGINEERING_HIGHLIGHTS,
} from '@/features/landing/landing-content'
import { SectionHeading } from '@/features/landing/section-heading'

export function ArchitectureSection() {
  return (
    <section
      id="architecture"
      aria-labelledby="architecture-heading"
      className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="architecture-heading"
          eyebrow="Architecture"
          title="A real three-tier stack, not a mock"
          description="A typed React client talks to a Django REST API over JWT-authenticated JSON. The API owns validation and authorization, and PostgreSQL owns the data."
        />

        <ol
          aria-label="Request flow"
          className="mt-14 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center"
        >
          {ARCHITECTURE.map(({ icon: Icon, name, role, points }, index) => (
            <Fragment key={name}>
              <li className="flex-1 rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {role}
                    </p>
                    <h3 className="font-semibold">{name}</h3>
                  </div>
                </div>
                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </li>
              {index < ARCHITECTURE.length - 1 ? (
                <li
                  aria-hidden
                  className="flex justify-center text-muted-foreground"
                >
                  <ArrowDown className="h-5 w-5 lg:hidden" />
                  <ArrowRight className="hidden h-5 w-5 lg:block" />
                </li>
              ) : null}
            </Fragment>
          ))}
        </ol>

        <ul className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {ENGINEERING_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
