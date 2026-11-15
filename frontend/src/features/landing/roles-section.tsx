import { Check } from 'lucide-react'
import { ROLES } from '@/features/landing/landing-content'
import { SectionHeading } from '@/features/landing/section-heading'

export function RolesSection() {
  return (
    <section
      id="roles"
      aria-labelledby="roles-heading"
      className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="roles-heading"
          title="The right access for every role"
          description="Four roles cover the whole team. Anything outside a role is hidden in the app and blocked on the server."
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((role) => (
            <li
              key={role.name}
              className="flex flex-col rounded-xl border bg-card p-6"
            >
              <h3 className="font-semibold">{role.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {role.summary}
              </p>
              <ul className="mt-5 space-y-2.5 border-t pt-5 text-sm">
                {role.can.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    {item}
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
