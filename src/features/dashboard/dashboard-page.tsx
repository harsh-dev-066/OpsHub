import { PageHeader } from '@/components/navigation/page-header'
import { DashboardKpis } from '@/features/dashboard/dashboard-kpis'
import { DashboardQuickLinks } from '@/features/dashboard/dashboard-quick-links'
import { OccupancyTrendSection } from '@/features/dashboard/occupancy-trend-section'
import { RecentActivitySection } from '@/features/dashboard/recent-activity-section'
import {
  TicketsByPrioritySection,
  TicketsByStatusSection,
} from '@/features/dashboard/tickets-breakdown-sections'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Operational overview across properties, units, and support tickets."
        actions={<DashboardQuickLinks />}
      />

      <DashboardKpis />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <OccupancyTrendSection className="lg:col-span-2" />
        <TicketsByPrioritySection />
        <TicketsByStatusSection />
        <RecentActivitySection className="lg:col-span-2" />
      </div>
    </div>
  )
}
