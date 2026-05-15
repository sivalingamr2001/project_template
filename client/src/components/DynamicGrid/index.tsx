import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { useTable } from "./CommonTable";
import { GridTableBody } from "./GridTableBody";
import { GridTableHeader } from "./GridTableHeader";
import { TablePagination } from "./TablePagination";
import { TableToolbar } from "./TableToolbar";
import type { DynamicGridProps } from "./types";

export function DynamicGrid<TData>({
  columns,
  data,
  isLoading,
  isFetching,
  onRefresh,
  globalFilterPlaceholder,
  canColumnFilter = true,
  canGlobalFilter = true,
  canSorting = true,
  canPagination = true,
  canRowSelection = false,
  pageSize = 10,
  title,
  description,
  onRowSelectionChange,
  emptyMessage,
  onCreate,
}: DynamicGridProps<TData>) {
  const { table, state, handleGlobalFilterChange } = useTable({
    data,
    columns,
    pageSize,
    canRowSelection,
    onRowSelectionChange,
  });

  const columnCount = table.getVisibleLeafColumns().length;
  const { pageIndex } = state.pagination;
  const pageCount = table.getPageCount();
  const selectedRows = Object.keys(state.rowSelection).filter(
    (k) => state.rowSelection[k],
  ).length;

  const handleFirstPage = () => table.setPageIndex(0);
  const handleLastPage = () => table.setPageIndex(pageCount - 1);
  const handlePreviousPage = () => table.previousPage();
  const handleNextPage = () => table.nextPage();

  return (
    <Card className="border-border bg-card w-full border shadow-sm">
      <CardHeader>
        <TableToolbar
          table={table}
          globalFilter={state.globalFilter}
          onGlobalFilterChange={handleGlobalFilterChange}
          onRefresh={onRefresh}
          onCreate={onCreate}
          isFetching={isFetching}
          canGlobalFilter={canGlobalFilter}
          placeholder={globalFilterPlaceholder}
          title={title}
          description={description}
        />
      </CardHeader>
      <CardContent>
        <div className="border-border overflow-hidden rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <GridTableHeader
                table={table}
                canSorting={canSorting}
                canColumnFilter={canColumnFilter}
              />
              <GridTableBody
                table={table}
                isLoading={isLoading}
                emptyMessage={emptyMessage}
                columnCount={columnCount}
              />
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {canPagination && (
          <TablePagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            canPreviousPage={table.getCanPreviousPage()}
            canNextPage={table.getCanNextPage()}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            onFirstPage={handleFirstPage}
            onLastPage={handleLastPage}
            pageSize={state.pagination.pageSize}
            totalRows={table.getFilteredRowModel().rows.length}
            selectedRows={selectedRows}
            canRowSelection={canRowSelection}
          />
        )}
      </CardFooter>
    </Card>
  );
}

export default DynamicGrid;
