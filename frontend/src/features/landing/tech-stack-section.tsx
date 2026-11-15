import { TECH_STACK } from '@/features/landing/landing-content'
import { SectionHeading } from '@/features/landing/section-heading'

export function TechStackSection() {
  return (
    <section
      id="stack"
      aria-labelledby="stack-heading"
      className="scroll-mt-20 border-t bg-muted/40 px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="stack-heading"
          eyebrow="Tech stack"
          title="Built with production-grade tools"
          description="Current, widely used libraries on both sides, with tests, linting and type checks run in CI on every push."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TECH_STACK.map(({ group, items }) => (
            <div
              key={group}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <h3 className="font-semibold">{group}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border bg-muted/50 px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
