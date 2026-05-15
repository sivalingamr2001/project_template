import React, { useCallback } from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TableToolbarProps } from "./types";

function RefreshButton({
  onRefresh,
  isFetching,
}: Pick<TableToolbarProps, "onRefresh" | "isFetching">) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onRefresh}
      disabled={isFetching}
      className="h-8 gap-1.5 text-xs font-medium"
      aria-label="Refresh data"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  );
}

function GlobalSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange],
  );

  return (
    <div className="relative">
      <Search className="text-muted-foreground pointer-events-none absolute top-2 left-2.5 h-4 w-4" />
      <Input
        placeholder={placeholder ?? "Search..."}
        value={value}
        onChange={handleChange}
        className="h-8 w-auto pl-8 text-sm"
      />
    </div>
  );
}

export function TableToolbar<TData>({
  table,
  globalFilter,
  onGlobalFilterChange,
  onRefresh,
  onCreate,
  isFetching,
  canGlobalFilter,
  placeholder,
  title,
  description,
}: TableToolbarProps<TData>) {
  const hasActiveFilters = table.getState().columnFilters.length > 0;

  return (
    <div className="border-border flex flex-col gap-2 border-b pb-3">
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-primary text-lg font-semibold tracking-wide uppercase">
              {title}
            </h2>
          )}
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {canGlobalFilter && (
            <GlobalSearchInput
              value={globalFilter}
              onChange={onGlobalFilterChange}
              placeholder={placeholder}
            />
          )}

          {/* MS CRM Style Global Clear Filter Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.resetColumnFilters()}
              className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive h-8 gap-1 border-dashed px-2.5 text-xs font-medium transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear Filters
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCreate && (
            <Button
              variant="default"
              size="sm"
              onClick={onCreate}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              Create
            </Button>
          )}
          {onRefresh && <RefreshButton onRefresh={onRefresh} isFetching={isFetching} />}
        </div>
      </div>
    </div>
  );
}
