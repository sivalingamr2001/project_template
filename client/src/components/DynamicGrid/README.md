# DynamicGrid

A world-class, feature-complete data table component built on **shadcn/ui** + **TanStack Table v8**.

## Folder Structure

```
DynamicGrid/
├── index.tsx                  # Public entry point — orchestrates everything
├── types.ts                   # All shared TypeScript interfaces
├── TableToolbar.tsx           # Search, refresh, column toggle toolbar
├── ColumnVisibilityDropdown.tsx # Column show/hide dropdown
├── ColumnFiltersRow.tsx       # Per-column filter inputs (datalist-enhanced)
├── GridTableHeader.tsx        # Header row + sort icons + column filters row
├── GridTableBody.tsx          # Data rows + loading + empty states
├── TablePagination.tsx        # First/prev/next/last + page info + selection count
├── hooks/
│   └── useTable.ts            # All TanStack Table state & configuration
└── DynamicGridDemo.tsx        # Full working usage example
```

## Features

| Feature | Prop |
|---|---|
| Global search | `canGlobalFilter` |
| Per-column filters (with autocomplete) | `canColumnFilter` |
| Multi-column sorting | `canSorting` |
| Column show/hide | `canColumnVisibility` |
| Pagination (first/prev/next/last) | `canPagination` |
| Row selection (checkbox) | `canRowSelection` |
| Data refresh button | `onRefresh` |
| Loading & empty states | `isLoading`, `emptyMessage` |
| Fetching spinner on refresh | `isFetching` |
| Title & description | `title`, `description` |
| Row selection callback | `onRowSelectionChange` |
| Custom page size | `pageSize` |
| Custom search placeholder | `globalFilterPlaceholder` |

## Installation

```bash
# Shadcn components required:
npx shadcn-ui@latest add table button input card badge dropdown-menu
npm install @tanstack/react-table
```

## Usage

```tsx
import { DynamicGrid } from "@/components/DynamicGrid";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<MyRow, unknown>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
];

<DynamicGrid
  columns={columns}
  data={rows}
  onRefresh={refetch}
  isFetching={isFetching}
  canGlobalFilter
  canColumnFilter
  canColumnVisibility
  canSorting
  canPagination
  canRowSelection
  pageSize={10}
  title="My Table"
  description="A searchable, filterable data grid"
  onRowSelectionChange={(rows) => console.log(rows)}
/>
```

## Rules Applied

| Rule | Implementation |
|---|---|
| R-01 Size limit | Every file is < 100 lines |
| R-02 Folder colocation | All files in `DynamicGrid/`, one `index.tsx` entry |
| R-03 Readability order | Types → Constants → Signature → Hooks → Derived → Handlers → Early returns → JSX |
| Props interface | Named `Props` locally, `DynamicGridProps` publicly |
| Event handlers | All named `handleXxx` |
| Boolean props | All prefixed `isXxx`, `hasXxx`, `canXxx` |
| Custom hooks | `useTable` |
| No inline arrows in JSX | ✅ All handlers are named functions |
| No deep ternaries | ✅ Extracted into named sub-components |
| No mixed logic + JSX | ✅ Logic in hooks/utils, JSX in render |
