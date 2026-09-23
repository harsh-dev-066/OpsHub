import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { QueryErrorState } from '@/components/feedback/states'
import { PageHeader } from '@/components/navigation/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Can } from '@/features/auth/permissions'
import {
  PropertyActivityPanel,
  PropertySummary,
  PropertyTicketsPanel,
  PropertyUnitsPanel,
} from '@/features/properties/property-detail-panels'
import { ApiError } from '@/lib/api/client'
import { propertiesApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'

export function PropertyDetailPage() {
  const { propertyId } = useParams({
    from: '/authenticated/properties/$propertyId',
  })

  const propertyQuery = useQuery({
    queryKey: queryKeys.properties.detail(propertyId),
    queryFn: () => propertiesApi.getById(propertyId),
  })

  const ticketsMetaQuery = useQuery({
    queryKey: queryKeys.properties.tickets(propertyId),
    queryFn: () =>
      propertiesApi.listTickets(propertyId, {
        page: 1,
        pageSize: 1,
        sortBy: 'updatedAt',
        sortDirection: 'desc',
      }),
  })

  const property = propertyQuery.data
  const isNotFound =
    propertyQuery.error instanceof ApiError &&
    propertyQuery.error.status === 404

  return (
    <div className="space-y-6">
      <PageHeader
        title={property?.name ?? (isNotFound ? 'Property not found' : 'Property')}
        description={
          property
            ? `${property.address}, ${property.city}, ${property.country}`
            : undefined
        }
        breadcrumbs={[
          { label: 'Properties', to: '/properties' },
          { label: property?.name ?? 'Detail' },
        ]}
        actions={
          property ? (
            <Can permission="properties:write">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  toast.message('Property editing is not available yet', {
                    description:
                      'Connect a write API to enable this action.',
                  })
                }
              >
                Edit property
              </Button>
            </Can>
          ) : null
        }
      />

      {propertyQuery.isError ? (
        <QueryErrorState
          title={isNotFound ? 'Property not found' : 'Unable to load property'}
          description={
            isNotFound
              ? 'This property may have been removed or the link is invalid.'
              : propertyQuery.error.message
          }
          onRetry={isNotFound ? undefined : () => propertyQuery.refetch()}
          action={
            <Button asChild variant="outline">
              <Link to="/properties">Back to properties</Link>
            </Button>
          }
        />
      ) : propertyQuery.isLoading || !property ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <PropertySummary property={property} />

          <Tabs defaultValue="units">
            <TabsList aria-label="Property sections">
              <TabsTrigger value="units">Units</TabsTrigger>
              <TabsTrigger value="tickets">Recent tickets</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="units">
              <PropertyUnitsPanel propertyId={propertyId} />
            </TabsContent>
            <TabsContent value="tickets">
              <PropertyTicketsPanel propertyId={propertyId} />
            </TabsContent>
            <TabsContent value="activity">
              <PropertyActivityPanel
                property={property}
                ticketTotal={ticketsMetaQuery.data?.total ?? 0}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
