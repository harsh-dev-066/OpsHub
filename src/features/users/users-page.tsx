import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { QueryErrorState } from '@/components/feedback/states'
import { PageHeader, SectionCard } from '@/components/navigation/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/features/settings/session-context'
import {
  UserFormDialog,
  type UserFormValues,
} from '@/features/users/user-form-dialog'
import { usersApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types/domain'

export function UsersPage() {
  const { canManageUsers } = useSession()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: usersApi.list,
  })

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('User created')
      setDialogOpen(false)
      setEditingUser(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: UserFormValues }) =>
      usersApi.update(id, {
        name: values.name,
        email: values.email,
        roles: values.roles as User['roles'],
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('User updated')
      setDialogOpen(false)
      setEditingUser(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase()
    const users = usersQuery.data ?? []
    if (!needle) return users
    return users.filter((user) =>
      [user.name, user.email, user.username, ...user.roles]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [search, usersQuery.data])

  function openCreate() {
    setEditingUser(null)
    setDialogOpen(true)
  }

  function openEdit(user: User) {
    if (user.roles.includes('Admin')) {
      toast.message('System admin is locked', {
        description: 'The admin operator account cannot be edited.',
      })
      return
    }
    setEditingUser(user)
    setDialogOpen(true)
  }

  async function handleSubmit(values: UserFormValues) {
    if (editingUser) {
      await updateMutation.mutateAsync({ id: editingUser.id, values })
      return
    }
    await createMutation.mutateAsync({
      name: values.name,
      email: values.email,
      username: values.username,
      roles: values.roles as User['roles'],
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="View console operators and their assigned roles."
        actions={
          canManageUsers ? (
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add user
            </Button>
          ) : null
        }
      />

      {!canManageUsers ? (
        <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          You can view users here. Only the admin operator can add or modify
          accounts.
        </p>
      ) : null}

      <SectionCard title="Users">
        <div className="mb-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, username, or role"
            aria-label="Search users"
          />
        </div>

        {usersQuery.isError ? (
          <QueryErrorState
            title="Unable to load users"
            description={usersQuery.error.message}
            onRetry={() => usersQuery.refetch()}
          />
        ) : usersQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <Users className="h-8 w-8 opacity-40" />
            <p>No users match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Username</th>
                  <th className="px-3 py-2 font-medium">Roles</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Joined</th>
                  {canManageUsers ? (
                    <th className="px-3 py-2 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isAdmin = user.roles.includes('Admin')
                  return (
                    <tr key={user.id} className="border-b last:border-b-0">
                      <td className="px-3 py-3 font-medium">{user.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">
                        {user.username}
                      </td>
                      <td className="px-3 py-3">{user.roles.join(', ')}</td>
                      <td className="px-3 py-3 capitalize">{user.status}</td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      {canManageUsers ? (
                        <td className="px-3 py-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isAdmin}
                            onClick={() => openEdit(user)}
                            aria-label={`Edit ${user.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </td>
                      ) : null}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {canManageUsers ? (
        <UserFormDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) setEditingUser(null)
          }}
          mode={editingUser ? 'edit' : 'create'}
          initialUser={editingUser}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      ) : null}
    </div>
  )
}
