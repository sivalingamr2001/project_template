import type { Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props<TData> {
  table: Table<TData>;
}

export function ColumnVisibilityDropdown<TData>({ table }: Props<TData>) {
  // Use getAllLeafColumns() to prevent structural columns from breaking layout loops
  const allColumns = table.getAllLeafColumns().filter((col) => col.getCanHide());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Toggle columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allColumns.map((column) => {
          // Resolve a fallback label if the header isn't a plain string
          const label =
            typeof column.columnDef.header === "string"
              ? column.columnDef.header
              : column.id;

          return (
            <DropdownMenuCheckboxItem
              // CRITICAL: column.id ensures React tracks the correct row even when others vanish
              key={column.id}
              className="cursor-pointer text-xs capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
