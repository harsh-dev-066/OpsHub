import { PageHeader, SectionCard } from '@/components/navigation/page-header'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/features/auth/auth-context'
import { usePermissions } from '@/features/auth/permissions'
import { useSession } from '@/features/settings/session-context'
import {
  getPermissionsForRole,
  ROLE_DESCRIPTIONS,
  ROLE_OPTIONS,
} from '@/lib/permissions'
import type { Role } from '@/types/domain'

export function SettingsPage() {
  const { role, setRole, user } = useSession()
  const { session } = useAuth()
  const { can } = usePermissions()
  const activePermissions = getPermissionsForRole(role)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and console role."
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
              <dt className="text-muted-foreground">Current role</dt>
              <dd className="mt-1 font-medium">{user.role}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Role">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="role">Active role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as Role)}
                disabled={!can('settings:write')}
              >
                <SelectTrigger id="role" aria-label="Select role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              {ROLE_DESCRIPTIONS[role]}
            </p>
            <p className="text-xs text-muted-foreground">
              Changing role updates which actions appear in the console.
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Effective permissions"
        description="Capabilities for the active role."
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
