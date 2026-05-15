import { flexRender, type Table } from "@tanstack/react-table";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface Props<TData> {
  table: Table<TData>;
  isLoading?: boolean;
  emptyMessage?: string;
  columnCount: number;
}

function LoadingState({ columnCount }: { columnCount: number }) {
  return (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-32 text-center">
        <div className="text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading data...</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

function EmptyState({ columnCount, message }: { columnCount: number; message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-32 text-center">
        <div className="text-muted-foreground flex flex-col items-center gap-1">
          <span className="text-sm font-medium">{message}</span>
          <span className="text-xs">Try adjusting your search or filters</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function GridTableBody<TData>({
  table,
  isLoading,
  emptyMessage,
  columnCount,
}: Props<TData>) {
  const rows = table.getRowModel().rows;
  const isEmpty = !isLoading && rows.length === 0;

  return (
    <TableBody>
      {isLoading && <LoadingState columnCount={columnCount} />}
      {isEmpty && (
        <EmptyState
          columnCount={columnCount}
          message={emptyMessage ?? "No results found"}
        />
      )}
      {!isLoading &&
        rows.map((row, index) => {
          // 👈 Grab the row index loop variable here
          const isEven = index % 2 === 0;

          return (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
              className={`border-border/50 hover:bg-muted/50 data-[state=selected]:bg-primary/5 border-b transition-colors ${
                isEven
                  ? "bg-background" // Color A: Default clean background
                  : "bg-muted/20 dark:bg-muted/10" // Color B: Alternating subtle tinted background
              }`}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-3 py-2.5 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
    </TableBody>
  );
}
