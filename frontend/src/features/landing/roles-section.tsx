import { Check, Minus } from 'lucide-react'
import { PERMISSION_ROWS } from '@/features/landing/landing-content'
import { SectionHeading } from '@/features/landing/section-heading'
import {
  getPermissionsForRole,
  ROLE_DESCRIPTIONS,
  ROLE_OPTIONS,
} from '@/lib/permissions'

/** Built from the same role → permission map the app uses, so it can't drift. */
export function RolesSection() {
  return (
    <section
      id="roles"
      aria-labelledby="roles-heading"
      className="scroll-mt-20 border-y bg-muted/40 px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="roles-heading"
          eyebrow="Access control"
          title="Four roles, enforced end to end"
          description="The interface adapts to each role, and the API independently rejects anything a role isn't allowed to do. Sign in with each demo account to see the difference."
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLE_OPTIONS.map((role) => (
            <li key={role} className="rounded-xl border bg-card p-5 shadow-sm">
              <p className="font-semibold">{role}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {ROLE_DESCRIPTIONS[role]}
              </p>
              <p className="mt-3 text-xs font-medium text-accent-foreground">
                {getPermissionsForRole(role).length} permissions
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="sr-only">
              Permissions granted to each role
            </caption>
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th scope="col" className="px-4 py-3 font-medium">
                  Capability
                </th>
                {ROLE_OPTIONS.map((role) => (
                  <th
                    key={role}
                    scope="col"
                    className="px-4 py-3 text-center font-medium"
                  >
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            {PERMISSION_ROWS.map(({ area, rows }) => (
              <tbody key={area}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={ROLE_OPTIONS.length + 1}
                    className="bg-muted/25 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {area}
                  </th>
                </tr>
                {rows.map(({ permission, label }) => (
                  <tr key={permission} className="border-t">
                    <th
                      scope="row"
                      className="px-4 py-2.5 text-left font-normal"
                    >
                      {label}
                    </th>
                    {ROLE_OPTIONS.map((role) => {
                      const allowed =
                        getPermissionsForRole(role).includes(permission)
                      return (
                        <td key={role} className="px-4 py-2.5 text-center">
                          {allowed ? (
                            <Check
                              className="mx-auto h-4 w-4 text-success-foreground"
                              aria-label="Allowed"
                            />
                          ) : (
                            <Minus
                              className="mx-auto h-4 w-4 text-muted-foreground/50"
                              aria-label="Not allowed"
                            />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </section>
  )
}
