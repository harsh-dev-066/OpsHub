import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useId, useMemo, useReducer, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  TransferListFilter,
  TransferListRow,
} from '@/components/transfer-list/TransferListRow'
import {
  initialTransferListState,
  transferListReducer,
} from '@/components/transfer-list/transferList.reducer'
import {
  computeDiff,
  diffOf,
  filterSideItems,
  formatSelectedCount,
  pluralize,
} from '@/components/transfer-list/transferList.utils'
import type {
  TransferListProps,
  TransferSide,
} from '@/components/transfer-list/types'
import { cn } from '@/lib/utils'

const DEFAULT_BOX_HEIGHT = 'clamp(240px, 36vh, 400px)'

function optionIdFrom(target: EventTarget | null): string | null {
  if (!(target instanceof HTMLElement)) return null
  return (
    target.closest<HTMLElement>('[data-option-id]')?.dataset.optionId ?? null
  )
}

export function TransferList({
  items,
  value,
  onChange,
  baselineIds,
  onReset,
  disabled = false,
  error = false,
  helperText,
  labels,
  boxHeight = DEFAULT_BOX_HEIGHT,
}: TransferListProps) {
  const instanceId = useId()
  const [state, dispatch] = useReducer(
    transferListReducer,
    initialTransferListState,
  )
  const [lastAction, setLastAction] = useState('')

  const chosen = useMemo(() => new Set(value), [value])
  const diff = useMemo(
    () => computeDiff(value, baselineIds),
    [value, baselineIds],
  )

  const availableNeedle = state.filters.available.trim().toLowerCase()
  const chosenNeedle = state.filters.chosen.trim().toLowerCase()

  const availableItems = useMemo(
    () => filterSideItems(items, chosen, 'available', availableNeedle),
    [items, chosen, availableNeedle],
  )
  const chosenItems = useMemo(
    () => filterSideItems(items, chosen, 'chosen', chosenNeedle),
    [items, chosen, chosenNeedle],
  )

  const moveIds = useCallback(
    (ids: readonly string[], to: TransferSide) => {
      if (ids.length === 0) return
      const currentSet = new Set(value)

      if (to === 'chosen') {
        const fresh = ids.filter((id) => !currentSet.has(id))
        if (fresh.length === 0) return
        onChange([...value, ...fresh])
        setLastAction(`added ${fresh.length}`)
      } else {
        const drop = new Set(ids.filter((id) => currentSet.has(id)))
        if (drop.size === 0) return
        onChange(value.filter((id) => !drop.has(id)))
        setLastAction(`removed ${drop.size}`)
      }

      dispatch({ type: 'clear' })
    },
    [onChange, value],
  )

  const addCount = state.selected.available.size
  const removeCount = state.selected.chosen.size
  const noun = (count: number) =>
    pluralize(count, labels.itemNoun, labels.itemNounPlural)

  const showDiff = baselineIds != null
  const hasDelta = diff.added.size > 0 || diff.removed.size > 0

  function renderBox(side: TransferSide) {
    const sideItems = side === 'available' ? availableItems : chosenItems
    const title =
      side === 'available' ? labels.availableTitle : labels.chosenTitle
    const filterValue = state.filters[side]
    const selected = state.selected[side]
    const activeId = state.active[side]
    const scopedTotal =
      side === 'available' ? items.length - chosen.size : chosen.size

    return (
      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border bg-card',
          error && side === 'chosen' && 'border-destructive',
          disabled && 'opacity-60',
        )}
        style={{ height: boxHeight }}
      >
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <p className="text-sm font-medium">{title}</p>
          <p className="ml-auto text-xs text-muted-foreground">
            {filterValue.trim()
              ? `${sideItems.length} of ${scopedTotal} shown`
              : `${scopedTotal} ${labels.itemNounPlural}`}
          </p>
        </div>

        <TransferListFilter
          value={filterValue}
          disabled={disabled}
          placeholder={labels.filterPlaceholder}
          label={`${labels.filterPlaceholder} in ${title}`}
          onChange={(next) =>
            dispatch({ type: 'setFilter', side, value: next })
          }
          onClear={() => dispatch({ type: 'setFilter', side, value: '' })}
        />

        {sideItems.length > 0 ? (
          <ul
            role="listbox"
            aria-multiselectable="true"
            aria-label={title}
            tabIndex={disabled ? -1 : 0}
            className="min-h-0 flex-1 overflow-y-auto py-1"
            onClick={(event) => {
              if (disabled) return
              const id = optionIdFrom(event.target)
              if (id == null) return
              dispatch({ type: 'pointerSelect', side, id })
            }}
            onDoubleClick={(event) => {
              if (disabled) return
              const id = optionIdFrom(event.target)
              if (id == null) return
              moveIds([id], side === 'available' ? 'chosen' : 'available')
            }}
          >
            {sideItems.map((item) => (
              <TransferListRow
                key={item.id}
                id={item.id}
                primary={item.primary}
                secondary={item.secondary}
                isSelected={selected.has(item.id)}
                isActive={activeId === item.id}
                diff={diffOf(item.id, diff)}
              />
            ))}
          </ul>
        ) : (
          <p className="flex flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground">
            {filterValue.trim()
              ? 'No matches'
              : side === 'available'
                ? `Every ${labels.itemNoun} is already chosen.`
                : `Nothing chosen yet. Select from ${labels.availableTitle} and add them.`}
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label={labels.sectionLabel}
      className="flex min-w-0 flex-col gap-3"
      data-transfer-list={instanceId}
    >
      <div className="flex min-h-8 flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {formatSelectedCount(chosen.size, items.length, labels.itemNounPlural)}
          {lastAction ? ` · ${lastAction}` : ''}
          {showDiff && hasDelta
            ? ` · ${[
                diff.added.size > 0 ? `+${diff.added.size}` : null,
                diff.removed.size > 0 ? `−${diff.removed.size}` : null,
              ]
                .filter(Boolean)
                .join(' ')}`
            : ''}
        </p>
        {showDiff && hasDelta && onReset ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="ml-auto h-auto px-0 text-emerald-700"
            disabled={disabled}
            onClick={onReset}
          >
            Reset changes
          </Button>
        ) : null}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        {renderBox('available')}

        <div className="flex flex-row items-center justify-center gap-2 sm:flex-col">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || addCount === 0}
            aria-label={`Add ${addCount} selected ${noun(addCount)}`}
            onClick={() => moveIds([...state.selected.available], 'chosen')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || removeCount === 0}
            aria-label={`Remove ${removeCount} selected ${noun(removeCount)}`}
            onClick={() => moveIds([...state.selected.chosen], 'available')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {renderBox('chosen')}
      </div>

      {helperText ? (
        <p
          className={cn(
            'text-xs',
            error ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
