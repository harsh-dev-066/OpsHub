import { PageHeader, SectionCard } from '@/components/navigation/page-header'
import { useAuth } from '@/features/auth/auth-context'
import { useSession } from '@/features/settings/session-context'
import {
  getPermissionsForRoles,
  ROLE_DESCRIPTIONS,
} from '@/lib/permissions'

export function SettingsPage() {
  const { user, roles } = useSession()
  const { session } = useAuth()
  const activePermissions = getPermissionsForRoles(roles)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="View your profile and effective console permissions."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Profile">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="mt-1 font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-1">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Signed in as</dt>
              <dd className="mt-1 font-mono text-sm">
                {session?.username ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Roles</dt>
              <dd className="mt-1 font-medium">{roles.join(', ')}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Role">
          <div className="space-y-3">
            <p className="text-sm font-medium">{user.role}</p>
            <p className="text-xs text-muted-foreground">
              {ROLE_DESCRIPTIONS[user.role]}
            </p>
            <p className="text-xs text-muted-foreground">
              Your roles are assigned by an administrator in User Management and
              cannot be changed here.
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Effective permissions"
        description="Capabilities granted by your assigned roles."
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {activePermissions.map((permission) => (
            <li
              key={permission}
              className="rounded-md border bg-muted/30 px-3 py-2 font-mono text-xs"
            >
              {permission}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}
