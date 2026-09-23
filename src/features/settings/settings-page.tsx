import { PageHeader, SectionCard } from '@/components/navigation/page-header'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSession } from '@/features/settings/session-context'
import { ROLE_OPTIONS } from '@/lib/permissions'
import type { Role } from '@/types/domain'

export function SettingsPage() {
  const { role, setRole, userName } = useSession()

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Demo profile and role switcher for interviewing UX permission checks."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Profile">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="mt-1 font-medium">{userName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-1">alex.morgan@opshub.demo</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Current role</dt>
              <dd className="mt-1 font-medium">{role}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard
          title="Demo role switcher"
          description="Frontend-only. Backend authorization would remain the source of truth."
        >
          <div className="space-y-2">
            <Label htmlFor="role">Active role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as Role)}
            >
              <SelectTrigger id="role" aria-label="Select demo role">
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
            <p className="text-xs text-muted-foreground">
              Use this control during demos to show how create/edit/status
              actions hide or disable by role.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
