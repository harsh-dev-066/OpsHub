import type { LucideIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * Dialog chrome for ticket create/edit. The header and the form's footer stay
 * pinned while the fields scroll, so actions are always reachable.
 */
export function TicketFormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,52rem)] max-w-xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="flex-row items-start gap-3 space-y-0 border-b px-6 py-5 pr-12">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="space-y-1">
            <DialogTitle className="text-base">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
