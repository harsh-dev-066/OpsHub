export type TransferSide = 'available' | 'chosen'

export type TransferRowDiff = 'added' | 'removed' | null

export type TransferListItem = {
  id: string
  primary: string
  secondary?: string
  searchText?: string
}

export type TransferListLabels = {
  sectionLabel: string
  availableTitle: string
  chosenTitle: string
  filterPlaceholder: string
  itemNoun: string
  itemNounPlural: string
}

export type TransferListProps = {
  items: readonly TransferListItem[]
  value: readonly string[]
  onChange: (next: string[]) => void
  baselineIds?: readonly string[]
  onReset?: () => void
  disabled?: boolean
  error?: boolean
  helperText?: string
  labels: TransferListLabels
  boxHeight?: string
}

export type TransferDiff = {
  added: ReadonlySet<string>
  removed: ReadonlySet<string>
}
