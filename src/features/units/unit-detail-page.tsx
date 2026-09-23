import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { QueryErrorState } from '@/components/feedback/states'
import { UnitStatusBadge } from '@/components/feedback/status-badges'
import { PageHeader, SectionCard } from '@/components/navigation/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/features/auth/permissions'
import { ApiError } from '@/lib/api/client'
import { unitsApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { formatCurrency, formatDate, formatLabel } from '@/lib/utils'

export function UnitDetailPage() {
  const { unitId } = useParams({ from: '/authenticated/units/$unitId' })

  const unitQuery = useQuery({
    queryKey: queryKeys.units.detail(unitId),
    queryFn: () => unitsApi.getById(unitId),
  })

  const unit = unitQuery.data
  const isNotFound =
    unitQuery.error instanceof ApiError && unitQuery.error.status === 404

  return (
    <div className="space-y-6">
      <PageHeader
        title={unit ? `Unit ${unit.unitNumber}` : isNotFound ? 'Unit not found' : 'Unit'}
        description={
          unit?.property
            ? `${unit.property.name} · ${formatLabel(unit.type)}`
            : undefined
        }
        breadcrumbs={[
          { label: 'Units', to: '/units' },
          { label: unit ? unit.unitNumber : 'Detail' },
        ]}
        actions={
          unit ? (
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/tickets" search={{ propertyId: unit.propertyId }}>
                  Related tickets
                </Link>
              </Button>
              <Can permission="units:write">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    toast.message('Unit editing is not available yet', {
                      description:
                        'Connect a write API to enable this action.',
                    })
                  }
                >
                  Edit unit
                </Button>
              </Can>
            </div>
          ) : null
        }
      />

      {unitQuery.isError ? (
        <QueryErrorState
          title={isNotFound ? 'Unit not found' : 'Unable to load unit'}
          description={
            isNotFound
              ? 'This unit may have been removed or the link is invalid.'
              : unitQuery.error.message
          }
          onRetry={isNotFound ? undefined : () => unitQuery.refetch()}
          action={
            <Button asChild variant="outline">
              <Link to="/units">Back to units</Link>
            </Button>
          }
        />
      ) : unitQuery.isLoading || !unit ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Unit summary">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <UnitStatusBadge status={unit.status} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Floor</dt>
                <dd className="mt-1 font-medium">{unit.floor}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="mt-1 font-medium">
                  {formatLabel(unit.type)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Monthly rate</dt>
                <dd className="mt-1 font-medium">
                  {formatCurrency(unit.monthlyRate)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Property</dt>
                <dd className="mt-1">
                  {unit.property ? (
                    <Link
                      to="/properties/$propertyId"
                      params={{ propertyId: unit.property.id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {unit.property.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Resident & contract">
            {unit.residentDetail ? (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Resident</dt>
                  <dd className="mt-1 font-medium">
                    {unit.residentDetail.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="mt-1">{unit.residentDetail.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="mt-1">{unit.residentDetail.phone}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Move-in</dt>
                  <dd className="mt-1">
                    {formatDate(unit.residentDetail.moveInDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Contract</dt>
                  <dd className="mt-1">
                    {formatDate(unit.contract?.startDate)} –{' '}
                    {formatDate(unit.contract?.endDate)} (
                    {unit.contract?.status ?? 'n/a'})
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                No resident currently assigned to this unit.
              </p>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  )
}
