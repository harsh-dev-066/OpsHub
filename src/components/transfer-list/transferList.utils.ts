import type {
  TransferDiff,
  TransferListItem,
  TransferSide,
} from '@/components/transfer-list/types'

const EMPTY_SET: ReadonlySet<string> = new Set()
const EMPTY_DIFF: TransferDiff = { added: EMPTY_SET, removed: EMPTY_SET }

export function computeDiff(
  value: readonly string[],
  baseline: readonly string[] | undefined,
): TransferDiff {
  if (baseline == null) return EMPTY_DIFF

  const saved = new Set(baseline)
  const chosen = new Set(value)
  const added = new Set<string>()
  const removed = new Set<string>()

  chosen.forEach((id) => {
    if (!saved.has(id)) added.add(id)
  })
  saved.forEach((id) => {
    if (!chosen.has(id)) removed.add(id)
  })

  return { added, removed }
}

export function diffOf(id: string, diff: TransferDiff) {
  if (diff.added.has(id)) return 'added' as const
  if (diff.removed.has(id)) return 'removed' as const
  return null
}

export function formatSelectedCount(
  selected: number,
  total: number,
  nounPlural: string,
) {
  return `${selected} of ${total} ${nounPlural} selected`
}

export function pluralize(count: number, noun: string, nounPlural: string) {
  return count === 1 ? noun : nounPlural
}

const needleOf = (item: TransferListItem) =>
  item.searchText ?? item.primary.toLowerCase()

export function filterSideItems(
  items: readonly TransferListItem[],
  chosen: ReadonlySet<string>,
  side: TransferSide,
  needle: string,
) {
  const wantChosen = side === 'chosen'
  return items.filter((item) => {
    if (chosen.has(item.id) !== wantChosen) return false
    if (needle !== '' && !needleOf(item).includes(needle)) return false
    return true
  })
}
