import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function FormField({
  id,
  label,
  error,
  description,
  hint,
  required,
  children,
  className,
}: {
  id: string
  label: string
  error?: string
  description?: string
  /** Right-aligned helper beside the label, e.g. a character counter. */
  hint?: ReactNode
  /** Shows a visual required marker (kept outside the label's accessible name). */
  required?: boolean
  children: ReactNode
  className?: string
}) {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex h-5 items-center justify-between gap-2">
        <div className="flex items-center gap-0.5">
          <Label htmlFor={id}>{label}</Label>
          {required ? (
            <span className="text-sm leading-none text-destructive" aria-hidden>
              *
            </span>
          ) : null}
        </div>
        {hint ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </div>
      {children}
      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-xs font-medium text-destructive"
          role="alert"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function describedByIds(
  id: string,
  hasError: boolean,
  hasDescription = false,
) {
  return (
    [
      hasDescription ? `${id}-description` : undefined,
      hasError ? `${id}-error` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined
  )
}
