import type { ColDef, GridOptions } from "ag-grid-community"
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import React, { useCallback, useMemo, useState } from "react"

import { useTheme } from "@/providers/theme-provider"
import { Separator } from "@/shared/components/ui/separator"
import { useDataGrid } from "../../hooks/useDataGrid"
import type { DataGridProps } from "../../types/DataGrid.types"
import { mergeColDef, PageSizeStorage } from "../../utils/gridUtils"
import { GridFooter } from "./GridFooter"
import { LoadingOverlay, NoRowsOverlay } from "./GridOverlays"
import { GridToolbar } from "./GridToolbar"

// Register all community modules ONCE at module level
ModuleRegistry.registerModules([AllCommunityModule])

// ─── Theme ────────────────────────────────────────────────────────────────────

const lightTheme = themeQuartz.withParams({
  accentColor: "#3b5bdb",
  headerBackgroundColor: "#f8f9ff",
  headerTextColor: "#1a1a2e",
  borderColor: "#e2e8f0",
  rowBorder: true,
  columnBorder: false,
  cellHorizontalPaddingScale: 1.15,
  fontFamily: "'Figtree', system-ui, sans-serif",
  fontSize: 13,
  rowHeight: 59,
  headerHeight: 48,
})

const darkTheme = themeQuartz.withParams({
  accentColor: "#748ffc",
  headerBackgroundColor: "#1e2030",
  headerTextColor: "#c5d0e6",
  borderColor: "#2d3149",
  backgroundColor: "#181926",
  foregroundColor: "#c5d0e6",
  rowBorder: true,
  columnBorder: false,
  cellHorizontalPaddingScale: 1.15,
  fontFamily: "'Figtree', system-ui, sans-serif",
  fontSize: 13,
  rowHeight: 59,
  headerHeight: 48,
})

// ─── BASE defaultColDef ───────────────────────────────────────────────────────

const BASE_COL_DEF: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  floatingFilter: false,
  minWidth: 80,
  suppressHeaderMenuButton: false,
}

// ─── Component ────────────────────────────────────────────────────────────────

function DataGridInner<TData extends Record<string, unknown>>(
  props: DataGridProps<TData>
) {
  const {
    rowData,
    columnDefs,
    title = "Data",
    gridId = "default",
    loading = false,
    pageSize: pageSizeProp,
    pageSizeOptions = [10, 25, 50, 100],
    rowSelection = "multiple",
    animateRows = true,
    showSearch = true,
    showRefreshButton = true,
    showClearFiltersButton = true,
    showExportCsvButton = true,
    showSelectedCount = true,
    toolbarLeft,
    toolbarRight,
    noRowsMessage = "No records found",
    loadingMessage = "Loading data…",
    onRowClicked,
    gridHeight = "400px",
    compact = false,
    theme = "system",
    defaultColDef: defaultColDefProp,
  } = props
  const { theme: appTheme } = useTheme()

  // Resolve initial page size (localStorage → prop → first option → 25)
  const [pageSize] = useState(() => {
    const stored = PageSizeStorage.get(gridId, 0)
    if (stored && pageSizeOptions.includes(stored)) return stored
    return pageSizeProp ?? pageSizeOptions[0] ?? 25
  })

  const { gridApiRef, state, handlers } = useDataGrid(props)

  // Merge col defaults
  const resolvedDefaultColDef = useMemo(
    () => mergeColDef(BASE_COL_DEF, defaultColDefProp),
    [defaultColDefProp]
  )

  // Row selection config
  const rowSelectionConfig = useMemo(() => {
    if (rowSelection === "none") return undefined
    return {
      mode:
        rowSelection === "single"
          ? ("singleRow" as const)
          : ("multiRow" as const),
      checkboxes: rowSelection === "multiple",
      headerCheckbox: rowSelection === "multiple",
    }
  }, [rowSelection])

  // Loading overlay - show/hide via grid API when loading prop changes
  const onBodyScroll = useCallback(() => {
    /* intentional no-op: keep for future virtualisation hooks */
  }, [])

  // Grid options
  const gridOptions = useMemo<GridOptions<TData>>(
    () => ({
      pagination: true,
      paginationPageSize: pageSize,
      domLayout: "autoHeight",
      paginationPageSizeSelector: false,
      suppressPaginationPanel: true,
      animateRows,
      enableCellTextSelection: true,
      suppressMovableColumns: false,
      rowSelection: rowSelectionConfig,
      defaultColDef: resolvedDefaultColDef,
      loadingOverlayComponent: () => (
        <LoadingOverlay message={loadingMessage} />
      ),
      noRowsOverlayComponent: () => <NoRowsOverlay message={noRowsMessage} />,
      ...(compact ? { rowHeight: 40, headerHeight: 40 } : {}),
    }),
    [
      pageSize,
      pageSizeOptions,
      animateRows,
      rowSelectionConfig,
      resolvedDefaultColDef,
      compact,
    ]
  )

  const resolvedTheme = useMemo(() => {
    if (theme === "light" || theme === "dark") {
      return theme
    }

    if (appTheme === "light" || appTheme === "dark") {
      return appTheme
    }

    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light"
    }

    return "light"
  }, [theme, appTheme])

  const selectedTheme = resolvedTheme === "dark" ? darkTheme : lightTheme

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
      .datagrid-scroll-shell {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .datagrid-scroll-inner {
        min-width: 960px;
      }
      @media (max-width: 768px) {
        .datagrid-tool-btn {
          padding: 6px 10px !important;
          min-width: 38px;
          justify-content: center;
        }
        .datagrid-btn-label {
          display: none;
        }
        .datagrid-search {
          flex: 1 1 100% !important;
          min-width: 100%;
        }
        .datagrid-toolbar-left {
          width: 100%;
          flex-wrap: wrap;
        }
        .datagrid-toolbar-right {
          width: 100%;
          flex-wrap: wrap;
          justify-content: flex-start;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .datagrid-toolbar-right > * {
          flex: 0 0 auto;
        }
        .datagrid-footer {
          gap: 10px;
        }
      }`}</style>
      <div
        style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 12,
          overflow: "hidden",
          width: "100%",
          boxSizing: "border-box",
        }}
        aria-label={`${title} data grid`}
        role="region"
      >
        {/* Toolbar */}
        <GridToolbar
          title={title}
          state={state}
          showSearch={showSearch}
          showRefresh={showRefreshButton}
          showClearFilters={showClearFiltersButton}
          showExportCsv={showExportCsvButton}
          showSelectedCount={showSelectedCount}
          toolbarLeft={toolbarLeft}
          toolbarRight={toolbarRight}
          onQuickFilterChange={handlers.onQuickFilterChange}
          onRefresh={handlers.onRefresh}
          onClearFilters={handlers.onClearFilters}
          onExportCsv={handlers.onExportCsv}
        />

        <Separator className="" />

        {/* Grid */}
        <div className="datagrid-scroll-shell">
          <div className="datagrid-scroll-inner">
            <div
              style={{
                height: gridHeight,
                width: "100%",
                position: "relative",
                margin: "15px 0",
              }}
            >
              <AgGridReact<TData>
                rowData={rowData}
                columnDefs={columnDefs}
                theme={selectedTheme}
                loading={loading}
                onGridReady={handlers.onGridReady}
                onSelectionChanged={handlers.onSelectionChanged}
                onFilterChanged={handlers.onFilterChanged}
                onSortChanged={handlers.onSortChanged}
                onPaginationChanged={handlers.onPaginationChanged}
                onRowClicked={onRowClicked}
                onBodyScroll={onBodyScroll}
                {...gridOptions}
              />
            </div>
          </div>
        </div>

        <GridFooter
          gridApiRef={gridApiRef}
          gridId={gridId}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          currentPage={state.currentPage}
          totalPages={state.totalPages}
          selectedCount={state.selectedCount}
          showSelectedCount={showSelectedCount}
        />
      </div>
    </>
  )
}

// Forward ref + generic wrapper to preserve TData generic
export const DataGrid = React.forwardRef(DataGridInner) as <
  TData extends Record<string, unknown> = Record<string, unknown>,
>(
  props: DataGridProps<TData> & { ref?: React.ForwardedRef<unknown> }
) => React.ReactElement

export default DataGrid
