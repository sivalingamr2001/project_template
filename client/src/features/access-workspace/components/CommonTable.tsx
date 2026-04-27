import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  IconMinus,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconLoader,
} from "@tabler/icons-react"

import CommonTablePagination from "./CommonTablePagination"
import CommonTableRow from "./CommonTableRow"
import type { TableColumn } from "../types"

type ServerPagination = {
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  page: number
  pageSize: number | undefined
  totalCount: number
}

type CommonTableProps<T> = {
  columns: TableColumn<T>[]
  emptyMessage: string
  getRowId?: (row: T, index: number) => string | number
  isLoading?: boolean
  onRefresh?: () => void
  pageSize?: number
  pagination?: ServerPagination
  searchPlaceholder?: string
  toolbarActions?: React.ReactNode
  renderExpandedRow?: (row: T) => React.ReactNode
  rows: T[]
}

function CommonTable<T>({
  columns,
  emptyMessage,
  getRowId,
  isLoading = false,
  onRefresh,
  pageSize = 10,
  pagination,
  searchPlaceholder = "Search",
  toolbarActions,
  renderExpandedRow,
  rows,
}: CommonTableProps<T>) {
  const isServerPaginated = Boolean(pagination)
  const [currentPage, setCurrentPage] = useState(pagination?.page ?? 1)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(
    null
  )

  useEffect(() => {
    if (!isServerPaginated) {
      setCurrentPage(1)
    }
    setExpandedRowId(null)
  }, [isServerPaginated, rows])

  useEffect(() => {
    if (isServerPaginated && pagination) {
      setCurrentPage(pagination.page)
    }
  }, [isServerPaginated, pagination?.page])

  const resolvedPageSize = pagination?.pageSize ?? pageSize
  const filteredRows = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()
    if (!normalizedSearchTerm) {
      return rows
    }

    return rows.filter((row) => {
      try {
        return JSON.stringify(row).toLowerCase().includes(normalizedSearchTerm)
      } catch {
        return false
      }
    })
  }, [rows, searchTerm])

  const visibleRows = useMemo(() => {
    if (isServerPaginated) {
      return filteredRows
    }

    const startIndex = (currentPage - 1) * resolvedPageSize
    return filteredRows.slice(startIndex, startIndex + resolvedPageSize)
  }, [currentPage, filteredRows, isServerPaginated, resolvedPageSize])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / resolvedPageSize))

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (pagination) {
      pagination.onPageChange(page)
    }
  }

  const hasRows = filteredRows.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full sm:max-w-xl">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search table"
            className="rounded-2xl border-input/80 bg-background pr-4 pl-10 text-sm shadow-sm placeholder:text-muted-foreground/80"
            onChange={(event) => {
              setSearchTerm(event.target.value)
              setCurrentPage(1)
            }}
            placeholder={searchPlaceholder}
            value={searchTerm}
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {onRefresh ? (
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={onRefresh}
            >
              <IconRefresh className="mr-2 size-4" />
              Refresh
            </Button>
          ) : null}
          {toolbarActions}
        </div>
      </div>
      <div className="md:hidden space-y-4 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-[0.6rem]">
            <div className="flex flex-col items-center gap-2">
              <IconLoader className="size-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        )}
        {hasRows ? (
          visibleRows.map((row, index) => {
            const rowId = getRowId?.(row, index) ?? index
            const isExpanded = expandedRowId === rowId
            const isExpandable = Boolean(renderExpandedRow)

            return (
              <div
                key={rowId}
                className="rounded-[0.6rem] border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-4">
                    {columns.map((column) => (
                      <div key={column.key}>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                          {column.header}
                        </p>
                        <div className="mt-1 text-sm">{column.render(row, index)}</div>
                      </div>
                    ))}
                  </div>
                  {isExpandable ? (
                    <Button
                      aria-expanded={isExpanded}
                      size="icon-xs"
                      type="button"
                      variant="outline"
                      onClick={() => setExpandedRowId(isExpanded ? null : rowId)}
                      className="self-start"
                    >
                      {isExpanded ? (
                        <IconMinus className="size-3.5" />
                      ) : (
                        <IconPlus className="size-3.5" />
                      )}
                    </Button>
                  ) : null}
                </div>
                {isExpanded && renderExpandedRow ? (
                  <div className="mt-4 rounded-xl border border-border bg-card p-4">
                    {renderExpandedRow(row)}
                  </div>
                ) : null}
              </div>
            )
          })
        ) : (
          <div className="rounded-[0.6rem] border border-border bg-background p-4 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>

      <div className="hidden md:block overflow-hidden rounded-[0.4rem] border border-border relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-[0.4rem]">
            <div className="flex flex-col items-center gap-2">
              <IconLoader className="size-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted text-left text-xs tracking-[0.18em] text-muted-foreground uppercase">
              <tr>
                {renderExpandedRow ? <th className="w-12 px-3 py-3" /> : null}
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {hasRows ? (
                visibleRows.map((row, index) => {
                  const rowId = getRowId?.(row, index) ?? index
                  const isExpanded = expandedRowId === rowId
                  const isExpandable = Boolean(renderExpandedRow)

                  return (
                    <CommonTableRow
                      key={rowId}
                      columns={columns}
                      isExpandable={isExpandable}
                      isExpanded={isExpanded}
                      onToggle={() => setExpandedRowId(isExpanded ? null : rowId)}
                      renderExpandedRow={renderExpandedRow}
                      row={row}
                    />
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (renderExpandedRow ? 1 : 0)}
                    className="p-6 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hasRows ? (
        <CommonTablePagination
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onPageSizeChange={pagination?.onPageSizeChange}
          pageSize={resolvedPageSize}
          totalCount={pagination?.totalCount}
          totalPages={isServerPaginated ? Math.ceil((pagination?.totalCount ?? 0) / (resolvedPageSize ?? 10)) : totalPages}
        />
      ) : null}
    </div>
  )
}

export default CommonTable
