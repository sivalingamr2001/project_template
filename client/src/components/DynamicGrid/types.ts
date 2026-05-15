import type {
  ColumnDef,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  Table,
} from "@tanstack/react-table";

export interface DynamicGridProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
  globalFilterPlaceholder?: string;
  canColumnFilter?: boolean;
  canGlobalFilter?: boolean;
  canColumnVisibility?: boolean;
  canSorting?: boolean;
  canPagination?: boolean;
  canRowSelection?: boolean;
  pageSize?: number;
  title?: string;
  description?: string;
  onRowSelectionChange?: (rows: TData[]) => void;
  onCreate?: () => void;
  emptyMessage?: string;
}

export interface TableToolbarProps<TData = any> {
  table: Table<TData>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onRefresh?: () => void;
  onCreate?: () => void;
  isFetching?: boolean;
  canGlobalFilter?: boolean;
  placeholder?: string;
  title?: string;
  description?: string;
}

export interface TablePaginationProps {
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  pageSize: number;
  totalRows: number;
  selectedRows: number;
  canRowSelection?: boolean;
}

export interface TableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: Record<string, boolean>;
  globalFilter: string;
  pagination: { pageIndex: number; pageSize: number };
}
