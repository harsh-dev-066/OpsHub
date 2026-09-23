import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  describedByIds,
  FormField,
} from '@/features/tickets/form-field'
import {
  ticketCategories,
  ticketFormSchema,
  ticketPriorities,
  type TicketFormValues,
} from '@/features/tickets/ticket-schema'
import { propertiesApi, unitsApi, usersApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'

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
    mode: 'onSubmit',
    reValidateMode: 'onChange',
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
  const errors = form.formState.errors

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
      <FormField id="title" label="Title" error={errors.title?.message}>
        <Input
          id="title"
          autoComplete="off"
          {...form.register('title')}
          aria-invalid={!!errors.title}
          aria-describedby={describedByIds('title', !!errors.title)}
        />
      </FormField>

      <FormField
        id="description"
        label="Description"
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          rows={4}
          {...form.register('description')}
          aria-invalid={!!errors.description}
          aria-describedby={describedByIds('description', !!errors.description)}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="category"
          label="Category"
          error={errors.category?.message}
        >
          <Controller
            control={form.control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="category"
                  aria-label="Category"
                  aria-invalid={!!errors.category}
                  aria-describedby={describedByIds(
                    'category',
                    !!errors.category,
                  )}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ticketCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          id="priority"
          label="Priority"
          error={errors.priority?.message}
        >
          <Controller
            control={form.control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="priority"
                  aria-label="Priority"
                  aria-invalid={!!errors.priority}
                  aria-describedby={describedByIds(
                    'priority',
                    !!errors.priority,
                  )}
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {ticketPriorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <FormField
        id="propertyId"
        label="Property"
        error={errors.propertyId?.message}
      >
        <Controller
          control={form.control}
          name="propertyId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="propertyId"
                aria-label="Property"
                aria-invalid={!!errors.propertyId}
                aria-describedby={describedByIds(
                  'propertyId',
                  !!errors.propertyId,
                )}
                disabled={propertiesQuery.isLoading || propertiesQuery.isError}
              >
                <SelectValue
                  placeholder={
                    propertiesQuery.isLoading
                      ? 'Loading properties...'
                      : propertiesQuery.isError
                        ? 'Unable to load properties'
                        : 'Select property'
                  }
                />
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
      </FormField>

      <FormField
        id="unitId"
        label="Unit"
        description="Optional. Units refresh when the property changes."
      >
        <Controller
          control={form.control}
          name="unitId"
          render={({ field }) => (
            <Select
              value={field.value ?? 'none'}
              onValueChange={(value) =>
                field.onChange(value === 'none' ? null : value)
              }
              disabled={!propertyId || unitsQuery.isLoading}
            >
              <SelectTrigger
                id="unitId"
                aria-label="Unit"
                aria-describedby={describedByIds('unitId', false, true)}
              >
                <SelectValue
                  placeholder={
                    !propertyId
                      ? 'Select a property first'
                      : unitsQuery.isLoading
                        ? 'Loading units...'
                        : 'Select unit (optional)'
                  }
                />
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
      </FormField>

      <FormField id="assignee" label="Assignee">
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
              <SelectTrigger
                id="assignee"
                aria-label="Assignee"
                disabled={usersQuery.isLoading}
              >
                <SelectValue
                  placeholder={
                    usersQuery.isLoading
                      ? 'Loading assignees...'
                      : 'Select assignee'
                  }
                />
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
      </FormField>

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
