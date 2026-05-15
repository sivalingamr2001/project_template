import { useState, useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  type ColumnDef,
  type Table,
} from "@tanstack/react-table";
import type { TableState } from "./types";

interface UseTableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  pageSize: number;
  canRowSelection?: boolean;
  onRowSelectionChange?: (rows: TData[]) => void;
}

interface UseTableReturn<TData> {
  table: Table<TData>;
  state: TableState;
  handleGlobalFilterChange: (value: string) => void;
}

export function useTable<TData>({
  data,
  columns,
  pageSize,
  canRowSelection,
  onRowSelectionChange,
}: UseTableOptions<TData>): UseTableReturn<TData> {
  const [sorting, setSorting] = useState<TableState["sorting"]>([]);
  const [columnFilters, setColumnFilters] = useState<TableState["columnFilters"]>([]);
  const [columnVisibility, setColumnVisibility] = useState<
    TableState["columnVisibility"]
  >({});
  const [rowSelection, setRowSelection] = useState<TableState["rowSelection"]>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const snoColumn: ColumnDef<TData, unknown> = useMemo(
    () => ({
      id: "sno",
      header: "S.No",
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
      size: 60,
      cell: ({ row, table: t }) => {
        const { pageIndex, pageSize: ps } = t.getState().pagination;
        const filteredRows = t.getFilteredRowModel().rows;
        const positionInFiltered = filteredRows.findIndex((r) => r.id === row.id);
        const base = pageIndex * ps;
        const sno =
          positionInFiltered !== -1 ? positionInFiltered + 1 : base + row.index + 1;
        return <span className="text-muted-foreground text-xs tabular-nums">{sno}</span>;
      },
    }),
    [],
  );

  const selectionColumn: ColumnDef<TData, unknown>[] = useMemo(() => {
    if (!canRowSelection) return [];
    return [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="border-border accent-primary h-4 w-4 cursor-pointer rounded"
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            className="border-border accent-primary h-4 w-4 cursor-pointer rounded"
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
    ];
  }, [canRowSelection]);

  const mergedColumns = useMemo(
    () => [snoColumn, ...selectionColumn, ...columns],
    [snoColumn, selectionColumn, columns],
  );

  const handleGlobalFilterChange = useCallback((value: string) => {
    setGlobalFilter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, []);

  const table = useReactTable({
    data,
    columns: mergedColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    enableRowSelection: canRowSelection,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(next);
      if (onRowSelectionChange) {
        const selectedRows = Object.keys(next)
          .filter((k) => next[k])
          .map((k) => data[parseInt(k)]);
        onRowSelectionChange(selectedRows.filter(Boolean));
      }
    },
    defaultColumn: {
      filterFn: "arrIncludesSome",
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: false,
  });

  const state: TableState = {
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    globalFilter,
    pagination,
  };
  return { table, state, handleGlobalFilterChange };
}
