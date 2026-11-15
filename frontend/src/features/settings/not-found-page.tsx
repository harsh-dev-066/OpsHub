import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/feedback/states'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/navigation/page-header'

export function NotFoundPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Page not found"
        description="The route you requested does not exist in OpsHub."
      />
      <EmptyState
        title="Nothing here"
        description="Check the URL or return to the dashboard to continue."
        action={
          <Button asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  )
}
