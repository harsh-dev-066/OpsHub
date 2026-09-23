import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { TransferList } from '@/components/transfer-list'
import type { TransferListItem } from '@/components/transfer-list'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { describedByIds, FormField } from '@/features/tickets/form-field'
import {
  ASSIGNABLE_ROLES,
  ROLE_DESCRIPTIONS,
} from '@/lib/permissions'
import type { Role, User } from '@/types/domain'

const userFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name.'),
  email: z.string().trim().email('Enter a valid email.'),
  username: z
    .string()
    .trim()
    .min(2, 'Enter a username.')
    .regex(/^[a-z0-9._-]+$/i, 'Use letters, numbers, dots, underscores, or hyphens.'),
  roles: z.array(z.string()).min(1, 'Assign at least one role.'),
})

export type UserFormValues = z.infer<typeof userFormSchema>

const ROLE_ITEMS: TransferListItem[] = ASSIGNABLE_ROLES.map((role) => ({
  id: role,
  primary: role,
  secondary: ROLE_DESCRIPTIONS[role],
  searchText: `${role} ${ROLE_DESCRIPTIONS[role]}`.toLowerCase(),
}))

const TRANSFER_LABELS = {
  sectionLabel: 'Role assignment',
  availableTitle: 'Available',
  chosenTitle: 'Chosen',
  filterPlaceholder: 'Filter roles...',
  itemNoun: 'role',
  itemNounPlural: 'roles',
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  initialUser,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialUser?: User | null
  onSubmit: (values: UserFormValues) => Promise<void>
  isSubmitting?: boolean
}) {
  const baselineRoles = useMemo(
    () => (initialUser?.roles.filter((role) => role !== 'Admin') as Role[]) ?? [],
    [initialUser],
  )

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    values: {
      name: initialUser?.name ?? '',
      email: initialUser?.email ?? '',
      username: initialUser?.username ?? '',
      roles: baselineRoles,
    },
  })

  const errors = form.formState.errors
  const chosenRoles = form.watch('roles')

  async function handleSubmit(values: UserFormValues) {
    await onSubmit({
      ...values,
      roles: values.roles.filter((role): role is Role =>
        ASSIGNABLE_ROLES.includes(role as Role),
      ),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add user' : 'Edit user'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a console user and assign roles. Admin cannot be assigned.'
              : 'Update profile details and assigned roles. Admin cannot be assigned.'}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="name" label="Name" error={errors.name?.message} required>
              <Input
                id="name"
                {...form.register('name')}
                aria-invalid={!!errors.name}
                aria-describedby={describedByIds('name', !!errors.name)}
              />
            </FormField>
            <FormField
              id="email"
              label="Email"
              error={errors.email?.message}
              required
            >
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                aria-invalid={!!errors.email}
                aria-describedby={describedByIds('email', !!errors.email)}
              />
            </FormField>
          </div>

          <FormField
            id="username"
            label="Username"
            error={errors.username?.message}
            required
            description={
              mode === 'edit'
                ? 'Username cannot be changed after creation.'
                : undefined
            }
          >
            <Input
              id="username"
              disabled={mode === 'edit'}
              autoComplete="off"
              {...form.register('username')}
              aria-invalid={!!errors.username}
              aria-describedby={describedByIds('username', !!errors.username)}
            />
          </FormField>

          <div className="space-y-2">
            <p className="text-sm font-medium">Roles</p>
            <TransferList
              items={ROLE_ITEMS}
              value={chosenRoles}
              baselineIds={baselineRoles}
              onChange={(next) =>
                form.setValue('roles', next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              onReset={() =>
                form.setValue('roles', baselineRoles, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              labels={TRANSFER_LABELS}
              error={!!errors.roles}
              helperText={
                errors.roles?.message ??
                'Move roles into Chosen. Admin is reserved for the system operator.'
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create user'
                  : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
