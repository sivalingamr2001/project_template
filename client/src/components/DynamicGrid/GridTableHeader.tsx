import { flexRender, type Table, type Header } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useMemo } from "react";

interface SortIconProps {
  isSorted: false | "asc" | "desc";
}

function SortIcon({ isSorted }: SortIconProps) {
  if (isSorted === "asc") return <ArrowUp className="text-primary ml-1.5 h-3.5 w-3.5" />;
  if (isSorted === "desc")
    return <ArrowDown className="text-primary ml-1.5 h-3.5 w-3.5" />;
  return (
    <ArrowUpDown className="text-muted-foreground/30 ml-1.5 h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
  );
}

// Fixed interface definition to match parameters passed from DynamicGrid
interface Props<TData> {
  table: Table<TData>;
  canSorting?: boolean;
  canColumnFilter?: boolean;
}

export function GridTableHeader<TData>({
  table,
  canSorting,
  canColumnFilter,
}: Props<TData>) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          className="border-border border-b hover:bg-transparent"
        >
          {headerGroup.headers.map((header) => {
            const canSort = canSorting && header.column.getCanSort();
            const isSorted = header.column.getIsSorted();

            // 3-way sorting logic cycle: asc -> desc -> default (clear)
            const handleSortClick = (e: React.MouseEvent) => {
              if (!canSort) return;
              if ((e.target as HTMLElement).closest(".filter-trigger-btn")) return;

              if (isSorted === "asc") {
                header.column.toggleSorting(true);
              } else if (isSorted === "desc") {
                header.column.clearSorting();
              } else {
                header.column.toggleSorting(false);
              }
            };

            return (
              <TableHead
                key={header.id}
                style={{ width: header.getSize() }}
                onClick={handleSortClick}
                className={`group text-muted-foreground px-3 py-2.5 text-xs font-semibold tracking-wider uppercase select-none ${
                  canSort ? "hover:text-foreground cursor-pointer transition-colors" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {canSort && <SortIcon isSorted={isSorted} />}
                  </div>

                  {/* Conditional Popover Render matching CRM layouts */}
                  {!header.isPlaceholder &&
                    canColumnFilter &&
                    header.column.getCanFilter() && (
                      <ColumnFilterPopover header={header} />
                    )}
                </div>
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}

function ColumnFilterPopover<TData>({ header }: { header: Header<TData, unknown> }) {
  const [searchVal, setSearchVal] = useState("");
  const column = header.column;

  // Extract faceted items directly from dataset matrix
  const facetedUniqueValues = column.getFacetedUniqueValues();
  const sortedUniqueValues = useMemo(
    () => Array.from(facetedUniqueValues.keys()).sort(),
    [facetedUniqueValues],
  );

  const currentFilterValue = (column.getFilterValue() as string[]) ?? [];

  const filteredOptions = sortedUniqueValues.filter((val) =>
    String(val).toLowerCase().includes(searchVal.toLowerCase()),
  );

  const isAllSelected = filteredOptions.every((v) =>
    currentFilterValue.includes(String(v)),
  );

  const toggleSelectAll = () => {
    if (isAllSelected) {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue(filteredOptions.map(String));
    }
  };

  const toggleOption = (val: string) => {
    const next = currentFilterValue.includes(val)
      ? currentFilterValue.filter((v) => v !== val)
      : [...currentFilterValue, val];
    column.setFilterValue(next.length ? next : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`filter-trigger-btn hover:bg-muted text-muted-foreground/60 hover:text-foreground ml-1 rounded p-1 transition-colors ${
            currentFilterValue.length
              ? "text-primary opacity-100"
              : "opacity-0 group-hover:opacity-100 focus:opacity-100"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-background border-border z-50 w-56 rounded-md border p-2 text-sm shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-muted/50 border-border focus:ring-primary w-full rounded border px-2 py-1 text-xs focus:ring-1 focus:outline-none"
          />
        </div>

        <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
          {searchVal === "" && (
            <label className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs font-medium">
              <input
                type="checkbox"
                checked={currentFilterValue.length === 0 || isAllSelected}
                onChange={toggleSelectAll}
                className="accent-primary border-border h-3.5 w-3.5 rounded"
              />
              (Select All)
            </label>
          )}

          {filteredOptions.map((val) => {
            const strVal = String(val);
            const isChecked = currentFilterValue.includes(strVal);
            return (
              <label
                key={strVal}
                className="hover:bg-muted/60 text-foreground/90 flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleOption(strVal)}
                  className="accent-primary border-border h-3.5 w-3.5 rounded"
                />
                {strVal || "(Blank)"}
              </label>
            );
          })}
        </div>

        {currentFilterValue.length > 0 && (
          <div className="border-border mt-2 flex justify-end border-t pt-1.5">
            <button
              onClick={() => column.setFilterValue(undefined)}
              className="text-destructive text-[11px] font-medium hover:underline"
            >
              Clear Filter
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
