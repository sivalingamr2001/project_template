import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { IconMinus, IconPlus } from "@tabler/icons-react"

import CommonTablePagination from "./CommonTablePagination"
import CommonTableRow from "./CommonTableRow"
import type { TableColumn } from "../types"

type CommonTableProps<T> = {
  columns: TableColumn<T>[]
  emptyMessage: string
  getRowId?: (row: T, index: number) => string | number
  pageSize?: number
  renderExpandedRow?: (row: T) => React.ReactNode
  rows: T[]
}

function CommonTable<T>({
  columns,
  emptyMessage,
  getRowId,
  pageSize = 5,
  renderExpandedRow,
  rows,
}: CommonTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(
    null
  )

  useEffect(() => {
    setCurrentPage(1)
    setExpandedRowId(null)
  }, [rows])

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return rows.slice(startIndex, startIndex + pageSize)
  }, [currentPage, pageSize, rows])

  if (!rows.length) {
    return (
      <div className="rounded-[1.4rem] border border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="md:hidden space-y-4">
        {currentRows.map((row, index) => {
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
        })}
      </div>

      <div className="hidden md:block overflow-hidden rounded-[0.4rem] border border-border">
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
              {currentRows.map((row, index) => {
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CommonTablePagination
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
      />
    </div>
  )
}

export default CommonTable
