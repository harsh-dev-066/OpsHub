import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatLabel } from '@/lib/utils'
import {
  ticketCategories,
  ticketPriorities,
  ticketStatuses,
} from '@/features/tickets/ticket-schema'

export function TicketsFilters({
  searchInput,
  onSearchInputChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
}: {
  searchInput: string
  onSearchInputChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  priority: string
  onPriorityChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
}) {
  return (
    <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Input
        type="search"
        enterKeyHint="search"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        placeholder="Search tickets..."
        aria-label="Search tickets"
      />
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger aria-label="Filter by status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {ticketStatuses.map((value) => (
            <SelectItem key={value} value={value}>
              {formatLabel(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger aria-label="Filter by priority">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {ticketPriorities.map((value) => (
            <SelectItem key={value} value={value}>
              {formatLabel(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger aria-label="Filter by category">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {ticketCategories.map((value) => (
            <SelectItem key={value} value={value}>
              {formatLabel(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

