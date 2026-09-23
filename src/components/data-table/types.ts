import type { ColumnDef, SortingState } from '@tanstack/react-table'

export interface DataTablePaginationState {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  /** When false, sort controls are hidden (embedded read-only tables). */
  enableSorting?: boolean
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  page?: number
  pageSize?: number
  total?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  getRowId?: (originalRow: TData, index: number) => string
  tableContainerClassName?: string
  /**
   * Grow to fill the parent flex column and scroll rows internally with a
   * sticky header. Parent must be a height-constrained flex column.
   */
  fillHeight?: boolean
}
