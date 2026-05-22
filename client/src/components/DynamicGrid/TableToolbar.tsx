import React, { useCallback } from "react";
import { RefreshCw, Search, X } from "lucide-react";
// 1. CHOOSE ONE ROUTER METHOD BASED ON YOUR FRAMEWORK:
// For Next.js:
// import { useRouter } from "next/navigation"; 
// For React Router / Vite:
// import { useNavigate } from "react-router-dom"; 

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TableToolbarProps } from "./types";
import { ComponentRequisitionModal } from "../DocumentViewer/ComponentRequisitionModal";

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
  onCreate, // Keep this prop in case you want to trigger callback events before routing
  isFetching,
  canGlobalFilter,
  placeholder,
  title,
  description,
}: TableToolbarProps<TData>) {
  const hasActiveFilters = table.getState().columnFilters.length > 0;
  
  // 2. INITIALIZE ROUTER HOOK HERE (Uncomment your framework's hook):
  // const router = useRouter(); // For Next.js
  // const navigate = useNavigate(); // For React Router

  const handleCreateRedirect = () => {
    // Optional: Call your original onCreate callback prop if needed
    if (onCreate) onCreate();

    // 3. TRIGGER ROUTE SWITCH:
    // Update "/requisitions/new" to your project's precise page route string
    // router.push("/requisitions/new"); // For Next.js
    // navigate("/requisitions/new"); // For React Router
  };

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
          <ComponentRequisitionModal triggerVariant="outline" />

          {/* Create Button: Swapped direct callback for routing function wrapper */}
          <Button
            variant="default"
            size="sm"
            onClick={handleCreateRedirect}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            Create
          </Button>
          {onRefresh && <RefreshButton onRefresh={onRefresh} isFetching={isFetching} />}
        </div>
      </div>
    </div>
  );
}
