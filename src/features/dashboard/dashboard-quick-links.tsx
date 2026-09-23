import { Link } from '@tanstack/react-router'
import { Building2, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardQuickLinks() {
  return (
    <nav aria-label="Dashboard quick links" className="flex flex-wrap gap-2">
      <Button asChild variant="outline">
        <Link to="/properties">
          <Building2 className="h-4 w-4" aria-hidden />
          View properties
        </Link>
      </Button>
      <Button asChild>
        <Link to="/tickets">
          <ClipboardList className="h-4 w-4" aria-hidden />
          View tickets
        </Link>
      </Button>
    </nav>
  )
}
