import type { ReactNode } from "react"

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

export type CommonTableProps<T> = {
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
}

