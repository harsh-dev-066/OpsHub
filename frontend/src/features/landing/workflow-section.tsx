import { WORKFLOW } from '@/features/landing/landing-content'
import { SectionHeading } from '@/features/landing/section-heading'

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      aria-labelledby="workflow-heading"
      className="scroll-mt-20 bg-muted/40 px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="workflow-heading"
          title="From issue to resolved"
          description="A simple loop the whole team can follow."
        />

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {WORKFLOW.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"
                  aria-hidden
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-muted-foreground tabular-nums">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
