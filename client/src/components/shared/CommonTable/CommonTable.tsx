import type { CommonTableProps } from "./types"
import { useCommonTable } from "./hooks/useCommonTable"
import { CommonTableToolbar } from "./CommonTableToolbar"
import { CommonTableTable } from "./CommonTableTable"
import { CommonTablePagination } from "./CommonTablePagination"

export function CommonTable<T>(props: CommonTableProps<T>) {
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

  const state = useCommonTable({
    data,
    rowToSearchString,
    enablePagination,
    itemsPerPage,
    externalCurrentPage,
    onPageChange,
  })

  if (isLoading) return <div className="py-8 text-center">Loading...</div>

  return (
    <div className="space-y-4">
      <CommonTableToolbar
        searchTerm={state.searchTerm}
        searchPlaceholder={searchPlaceholder}
        onSearchTermChange={state.setSearchTerm}
        onRefresh={onRefresh}
        primaryAction={primaryAction}
      />

      <CommonTableTable
        columns={columns}
        renderRowActions={renderRowActions}
        rowKey={rowKey}
        data={state.paginatedData}
        emptyMessage={emptyMessage}
      />

      {enablePagination && state.totalPages > 1 && (
        <CommonTablePagination
          currentPage={state.currentPage}
          totalPages={state.totalPages}
          itemsPerPage={itemsPerPage}
          filteredCount={state.filteredData.length}
          onPageChange={state.setCurrentPage}
        />
      )}
    </div>
  )
}

