import React, { useCallback } from "react";
import type { Column, Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";

interface ColumnFilterInputProps<TData> {
  column: Column<TData, unknown>;
}

function ColumnFilterInput<TData>({ column }: ColumnFilterInputProps<TData>) {
  const filterValue = (column.getFilterValue() as string) ?? "";
  const uniqueValues = column.getFacetedUniqueValues();
  const sortedUniqueValues = React.useMemo(
    () => Array.from(uniqueValues.keys()).sort().slice(0, 100),
    [uniqueValues],
  );
  const listId = `${column.id}-list`;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      column.setFilterValue(e.target.value);
    },
    [column],
  );

  return (
    <>
      <datalist id={listId}>
        {sortedUniqueValues.map((value) => (
          <option key={String(value)} value={String(value)} />
        ))}
      </datalist>
      <Input
        type="text"
        value={filterValue}
        onChange={handleChange}
        placeholder={`Filter...`}
        list={listId}
        className="border-border/60 h-7 w-full px-2 text-xs focus-visible:ring-1"
      />
    </>
  );
}

interface Props<TData> {
  table: Table<TData>;
}

export function ColumnFiltersRow<TData>({ table }: Props<TData>) {
  const visibleColumns = table.getVisibleLeafColumns();

  return (
    <tr className="border-border bg-muted/30 border-b">
      {visibleColumns.map((column) => (
        <th key={column.id} className="px-3 py-1.5 text-left font-normal">
          {column.getCanFilter() ? <ColumnFilterInput column={column} /> : null}
        </th>
      ))}
    </tr>
  );
}
