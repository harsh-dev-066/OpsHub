import { FEATURES } from '@/features/landing/landing-content'
import { SectionHeading } from '@/features/landing/section-heading'

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="scroll-mt-20 border-t px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="features-heading"
          title="Built for the people running the buildings"
          description="The essentials an operations team uses every day, without the clutter."
        />

        <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title}>
              <Icon className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
