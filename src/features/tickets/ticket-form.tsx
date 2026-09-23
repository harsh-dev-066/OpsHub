import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  ticketFormSchema,
  type TicketFormValues,
} from '@/features/tickets/ticket-schema'
import { propertiesApi, unitsApi, usersApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'

const categories = [
  'maintenance',
  'cleaning',
  'noise',
  'billing',
  'access',
  'other',
] as const
const priorities = ['low', 'medium', 'high', 'critical'] as const

interface TicketFormProps {
  defaultValues?: Partial<TicketFormValues>
  submitLabel?: string
  onSubmit: (values: TicketFormValues) => Promise<void> | void
  onCancel?: () => void
  isSubmitting?: boolean
}

export function TicketForm({
  defaultValues,
  submitLabel = 'Create ticket',
  onSubmit,
  onCancel,
  isSubmitting,
}: TicketFormProps) {
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'maintenance',
      priority: 'medium',
      propertyId: '',
      unitId: null,
      assignee: null,
      ...defaultValues,
    },
  })

  const propertyId = form.watch('propertyId')
  const previousPropertyId = useRef(propertyId)

  const propertiesQuery = useQuery({
    queryKey: queryKeys.properties.list({ page: 1, pageSize: 100 }),
    queryFn: () => propertiesApi.list({ page: 1, pageSize: 100 }),
  })

  const unitsQuery = useQuery({
    queryKey: queryKeys.units.list({ propertyId, page: 1, pageSize: 100 }),
    queryFn: () => unitsApi.list({ propertyId, page: 1, pageSize: 100 }),
    enabled: Boolean(propertyId),
  })

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: usersApi.list,
  })

  useEffect(() => {
    if (previousPropertyId.current !== propertyId) {
      form.setValue('unitId', null)
      previousPropertyId.current = propertyId
    }
  }, [propertyId, form])

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values)
      })}
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...form.register('title')}
          aria-invalid={!!form.formState.errors.title}
        />
        {form.formState.errors.title ? (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          aria-invalid={!!form.formState.errors.description}
        />
        {form.formState.errors.description ? (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Controller
            control={form.control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-label="Category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Controller
            control={form.control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-label="Priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Property</Label>
        <Controller
          control={form.control}
          name="propertyId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-label="Property">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {(propertiesQuery.data?.data ?? []).map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.propertyId ? (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.propertyId.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Unit</Label>
        <Controller
          control={form.control}
          name="unitId"
          render={({ field }) => (
            <Select
              value={field.value ?? 'none'}
              onValueChange={(value) =>
                field.onChange(value === 'none' ? null : value)
              }
              disabled={!propertyId}
            >
              <SelectTrigger aria-label="Unit">
                <SelectValue placeholder="Select unit (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No unit</SelectItem>
                {(unitsQuery.data?.data ?? []).map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.unitNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Assignee</Label>
        <Controller
          control={form.control}
          name="assignee"
          render={({ field }) => (
            <Select
              value={field.value ?? 'unassigned'}
              onValueChange={(value) =>
                field.onChange(value === 'unassigned' ? null : value)
              }
            >
              <SelectTrigger aria-label="Assignee">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {(usersQuery.data ?? []).map((user) => (
                  <SelectItem key={user.id} value={user.name}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
