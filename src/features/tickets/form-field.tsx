import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function FormField({
  id,
  label,
  error,
  description,
  children,
  className,
}: {
  id: string
  label: string
  error?: string
  description?: string
  children: ReactNode
  className?: string
}) {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
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
