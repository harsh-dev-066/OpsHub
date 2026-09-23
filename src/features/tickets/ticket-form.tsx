import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
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
import { describedByIds, FormField } from '@/features/tickets/form-field'
import {
  ticketCategories,
  ticketFormSchema,
  ticketPriorities,
  type TicketFormValues,
} from '@/features/tickets/ticket-schema'
import { propertiesApi, unitsApi, usersApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { cn, formatLabel } from '@/lib/utils'
import type { TicketPriority } from '@/types/domain'

const DESCRIPTION_MAX = 2000

/** Severity dot shown next to each priority option (label carries meaning too). */
const priorityDotClassName: Record<TicketPriority, string> = {
  low: 'bg-muted-foreground/50',
  medium: 'bg-info-foreground',
  high: 'bg-warning-foreground',
  critical: 'bg-destructive',
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

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
  const descriptionLength = form.watch('description')?.length ?? 0
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
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values)
      })}
      onKeyDown={(event) => {
        // Cmd/Ctrl + Enter submits from any field, including the textarea.
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          event.currentTarget.requestSubmit()
        }
      }}
      noValidate
    >
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <FormSection title="Issue">
          <FormField
            id="title"
            label="Title"
            required
            error={errors.title?.message}
          >
            <Input
              id="title"
              autoComplete="off"
              placeholder="e.g. AC not cooling in unit 204"
              {...form.register('title')}
              aria-invalid={!!errors.title}
              aria-describedby={describedByIds('title', !!errors.title)}
            />
          </FormField>

          <FormField
            id="description"
            label="Description"
            required
            hint={`${descriptionLength}/${DESCRIPTION_MAX}`}
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              rows={4}
              maxLength={DESCRIPTION_MAX}
              placeholder="What happened, where, and since when? Add anything that helps the team respond."
              className="resize-y"
              {...form.register('description')}
              aria-invalid={!!errors.description}
              aria-describedby={describedByIds(
                'description',
                !!errors.description,
              )}
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
                      className="capitalize"
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
                        <SelectItem
                          key={category}
                          value={category}
                          className="capitalize"
                        >
                          {formatLabel(category)}
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
                      className="capitalize"
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
                        <SelectItem
                          key={priority}
                          value={priority}
                          className="capitalize"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                'h-2 w-2 rounded-full',
                                priorityDotClassName[priority],
                              )}
                              aria-hidden
                            />
                            {priority}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
        </FormSection>

        <div className="h-px bg-border" aria-hidden />

        <FormSection title="Location & assignment">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="propertyId"
              label="Property"
              required
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
                      disabled={
                        propertiesQuery.isLoading || propertiesQuery.isError
                      }
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
              hint="Optional"
              description={
                propertyId
                  ? 'Units for the selected property.'
                  : 'Choose a property first.'
              }
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
                          Unit {unit.unitNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <FormField id="assignee" label="Assignee" hint="Optional">
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
        </FormSection>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t bg-muted/40 px-6 py-4">
        <p className="hidden text-xs text-muted-foreground sm:block">
          <kbd className="rounded border bg-card px-1.5 py-0.5 font-sans text-[11px] font-medium">
            ⌘/Ctrl
          </kbd>{' '}
          +{' '}
          <kbd className="rounded border bg-card px-1.5 py-0.5 font-sans text-[11px] font-medium">
            Enter
          </kbd>{' '}
          to submit
        </p>
        <div className="ml-auto flex gap-2">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
