import { Check, CheckSquare, Search, Square, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TransferRowDiff } from '@/components/transfer-list/types'

export function TransferListRow({
  id,
  primary,
  secondary,
  isSelected,
  isActive,
  diff,
}: {
  id: string
  primary: string
  secondary?: string
  isSelected: boolean
  isActive: boolean
  diff: TransferRowDiff
}) {
  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-label={diff == null ? undefined : `${primary}, ${diff}`}
      title={secondary ?? primary}
      data-option-id={id}
      className={cn(
        'relative flex cursor-pointer items-start gap-2 px-3 py-2 text-sm transition-colors',
        isActive && 'bg-accent',
        isSelected && !isActive && 'bg-muted/50',
        'hover:bg-muted/70',
        diff === 'added' && 'border-l-2 border-l-emerald-500',
        diff === 'removed' && 'border-l-2 border-l-destructive',
      )}
    >
      {isSelected ? (
        <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      ) : (
        <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      {diff == null ? null : (
        <span
          aria-hidden
          className={cn(
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white',
            diff === 'added' ? 'bg-emerald-500' : 'bg-destructive',
          )}
        >
          {diff === 'added' ? (
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          ) : (
            '−'
          )}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{primary}</span>
        {secondary ? (
          <span className="block truncate text-xs text-muted-foreground">
            {secondary}
          </span>
        ) : null}
      </span>
    </li>
  )
}

export function TransferListFilter({
  value,
  onChange,
  onClear,
  placeholder,
  label,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder: string
  label: string
  disabled?: boolean
}) {
  return (
    <div className="relative border-b px-3 py-2">
      <Search
        className="pointer-events-none absolute top-1/2 left-5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-8 w-full rounded-md border border-input bg-transparent py-1 pr-8 pl-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          aria-label="Clear filter"
          className="absolute top-1/2 right-5 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  )
}
