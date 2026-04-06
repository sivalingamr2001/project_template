import { useMemo, useState, useEffect, type ReactNode } from "react"
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

export interface CommonTableColumn<T> {
  header: string
  cell: (item: T) => ReactNode
  className?: string
}

export interface CommonTableAction {
  label: string
  icon?: ReactNode
  onClick: () => void
}

export function CommonTable<T>(props: {
  data: T[]
  isLoading: boolean
  rowKey: (item: T) => number
  columns: CommonTableColumn<T>[]
  renderRowActions?: (item: T) => ReactNode
  rowToSearchString?: (item: T) => string
  onRefresh?: () => void
  primaryAction?: CommonTableAction
  emptyMessage?: string
  searchPlaceholder?: string
  enablePagination?: boolean
  itemsPerPage?: number
  currentPage?: number
  onPageChange?: (page: number) => void
}) {
  const {
    data,
    isLoading,
    rowKey,
    columns,
    renderRowActions,
    rowToSearchString,
    onRefresh,
    primaryAction,
    emptyMessage = "No data available",
    searchPlaceholder = "Search",
    enablePagination = false,
    itemsPerPage = 10,
    currentPage: externalCurrentPage,
    onPageChange,
  } = props

  const [searchTerm, setSearchTerm] = useState("")

  const [internalCurrentPage, setInternalCurrentPage] = useState(1)
  const currentPage = externalCurrentPage ?? internalCurrentPage
  const setCurrentPage = (page: number) => {
    if (onPageChange) {
      onPageChange(page)
    } else {
      setInternalCurrentPage(page)
    }
  }

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query || !rowToSearchString) return data

    return data.filter((item) =>
      rowToSearchString(item).toLowerCase().includes(query)
    )
  }, [data, rowToSearchString, searchTerm])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Reset to page 1 when search changes and current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  const paginatedData = useMemo(() => {
    if (!enablePagination) return filteredData
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, enablePagination, currentPage, itemsPerPage])

  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onRefresh?.()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {primaryAction && (
            <Button onClick={primaryAction.onClick}>
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-none border border-border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="w-fit text-left">
              {columns.map((column) => (
                <TableHead key={column.header} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {renderRowActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (renderRowActions ? 1 : 0)}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={rowKey(item)}>
                  {columns.map((column) => (
                    <TableCell key={column.header} className={column.className}>
                      {column.cell(item)}
                    </TableCell>
                  ))}
                  {renderRowActions && (
                    <TableCell>{renderRowActions(item)}</TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
