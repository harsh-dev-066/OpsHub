import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Compact chip for active list filters (e.g. deep-linked propertyId). */
export function ActiveFilterChip({
  label,
  onClear,
}: {
  label: string
  onClear: () => void
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1 text-xs text-foreground">
        {label}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={onClear}
          aria-label={`Clear filter: ${label}`}
        >
          <X className="h-3 w-3" aria-hidden />
        </Button>
      </span>
    </div>
  )
}
