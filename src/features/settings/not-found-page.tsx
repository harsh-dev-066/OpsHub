import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/navigation/page-header'

export function NotFoundPage() {
  return (
    <div>
      <PageHeader
        title="Page not found"
        description="The route you requested does not exist in OpsHub."
      />
      <Button asChild>
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}
