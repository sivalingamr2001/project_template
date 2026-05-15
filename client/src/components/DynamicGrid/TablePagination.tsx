import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TablePaginationProps } from "./types";

function SelectionInfo({
  selectedRows,
  totalRows,
}: {
  selectedRows: number;
  totalRows: number;
}) {
  if (selectedRows === 0) return null;
  return (
    <span className="text-muted-foreground text-xs">
      {selectedRows} of {totalRows} row(s) selected
    </span>
  );
}

function PageInfo({ pageIndex, pageCount }: { pageIndex: number; pageCount: number }) {
  return (
    <span className="text-muted-foreground text-xs">
      Page {pageIndex + 1} of {pageCount || 1}
    </span>
  );
}

export function TablePagination({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
  onFirstPage,
  onLastPage,
  totalRows,
  selectedRows,
  canRowSelection,
}: TablePaginationProps) {
  return (
    <div className="border-border flex w-full flex-wrap items-center justify-between gap-2 border-t pt-3">
      <div className="flex items-center gap-3">
        {canRowSelection && (
          <SelectionInfo selectedRows={selectedRows} totalRows={totalRows} />
        )}
        <span className="text-muted-foreground text-xs">{totalRows} total rows</span>
      </div>
      <div className="flex items-center gap-1">
        <PageInfo pageIndex={pageIndex} pageCount={pageCount} />
        <div className="ml-2 flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onFirstPage}
            disabled={!canPreviousPage}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onPreviousPage}
            disabled={!canPreviousPage}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onNextPage}
            disabled={!canNextPage}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onLastPage}
            disabled={!canNextPage}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
