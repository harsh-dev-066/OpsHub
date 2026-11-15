import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState, QueryErrorState } from '@/components/feedback/states'
import { cn } from '@/lib/utils'
import type { DataTableProps } from '@/components/data-table/types'

export type { DataTableProps } from '@/components/data-table/types'

export function DataTable<TData, TValue>({
  columns,
  data,
  sorting = [],
  onSortingChange,
  enableSorting = true,
  isLoading,
  isError,
  onRetry,
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting your filters or search.',
  page = 1,
  pageSize = 10,
  total = 0,
  totalPages = 1,
  onPageChange,
  getRowId,
  tableContainerClassName,
  fillHeight = false,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    enableSorting,
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      onSortingChange?.(next)
    },
  })

  if (isError) {
    return <QueryErrorState onRetry={onRetry} />
  }

  const rows = table.getRowModel().rows

  return (
    <div
      className={cn(
        'space-y-3',
        fillHeight &&
          'flex flex-col md:min-h-0 md:flex-1 md:space-y-0 md:gap-3',
      )}
    >
      <div
        className={cn(
          'overflow-hidden rounded-xl border bg-card shadow-sm',
          fillHeight && 'md:flex md:min-h-0 md:flex-initial md:flex-col',
          tableContainerClassName,
        )}
      >
        <Table containerClassName={cn(fillHeight && 'md:min-h-0 md:flex-1')}>
          <TableHeader
            className={cn(
              fillHeight &&
                'md:sticky md:top-0 md:z-10 md:bg-background md:shadow-[inset_0_-1px_0_hsl(var(--border))] md:[&_tr]:border-b-0',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  const label =
                    typeof header.column.columnDef.header === 'string'
                      ? header.column.columnDef.header
                      : header.column.id

                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        canSort
                          ? sorted === 'asc'
                            ? 'ascending'
                            : sorted === 'desc'
                              ? 'descending'
                              : 'none'
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="-ml-2 h-8 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                          aria-label={`Sort by ${label}`}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === 'asc' ? (
                            <ArrowUp className="ml-1 h-3.5 w-3.5" aria-hidden />
                          ) : sorted === 'desc' ? (
                            <ArrowDown
                              className="ml-1 h-3.5 w-3.5"
                              aria-hidden
                            />
                          ) : (
                            <ArrowUpDown
                              className="ml-1 h-3.5 w-3.5 opacity-50"
                              aria-hidden
                            />
                          )}
                        </Button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 5) }).map(
                (_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={`skeleton-${rowIndex}-${colIndex}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} data-row-id={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    className="border-0 bg-transparent"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {onPageChange ? (
        <nav
          aria-label="Table pagination"
          className="flex shrink-0 flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="tabular-nums">
            {total === 0
              ? '0 results'
              : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <span className="tabular-nums">
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading || totalPages === 0}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  )
}
