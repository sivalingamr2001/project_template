import {
  themeQuartz,
  type CsvExportParams,
  type GridOptions,
  type GridReadyEvent,
} from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import { RefreshCcw, Search, X } from "lucide-react"
import { useCallback, useMemo, useRef, useState } from "react"
import type { ReusableAgGridProps } from "../types"
import LoadingSpinner from "./LoadingSpinner"
import ToolBtn from "./ToolBtn"

export function ReusableAgGrid<TData = unknown>({
  title = "Data Grid",
  rowData,
  columnDefs,
  gridOptions = {},
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 25,
  showSearch = true,
  showRefresh = true,
  showExportCsv = true,
  autoSizeMode = "fit",
  toolbarButtons = [],
  onGridReady,
  onSelectionChanged,
  onRowClicked,
  gridHeight = 480,
  rowSelection,
  loading = false,
  noRowsText = "No records found",
}: ReusableAgGridProps<TData>) {
  const gridRef = useRef<AgGridReact<TData>>(null)
  const [searchText, setSearchText] = useState("")
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)

  // ── auto-size on ready ────────────────────────────────────────────────────
  const handleGridReady = useCallback(
    (event: GridReadyEvent<TData>) => {
      const api = event.api

      if (autoSizeMode === "fit") {
        // No strategy object needed; this fits columns to the grid width
        api.sizeColumnsToFit()
      } else if (autoSizeMode === "content") {
        // This automatically sizes columns based on cell content
        api.autoSizeAllColumns()
      }

      onGridReady?.(event)
    },
    [autoSizeMode, onGridReady]
  )

  const gridTheme = themeQuartz.withParams({
    accentColor: "#3b5bdb",
    headerBackgroundColor: "#f8f9ff",
    headerTextColor: "#1a1a2e",
    borderColor: "#e2e8f0",
    rowBorder: true,
    columnBorder: false,
    cellHorizontalPaddingScale: 1.2,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: 13,
    rowHeight: 40,
    headerHeight: 44,
  })

  // ── search ────────────────────────────────────────────────────────────────
  const handleSearch = useCallback((value: string) => {
    setSearchText(value)
    gridRef.current?.api?.setGridOption("quickFilterText", value)
  }, [])

  // ── refresh ───────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    gridRef.current?.api?.refreshCells({ force: true })
    setTimeout(() => setIsRefreshing(false), 600)
  }, [])

  // ── page size ─────────────────────────────────────────────────────────────
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    gridRef.current?.api?.setGridOption("paginationPageSize", size)
  }, [])

  // ── selection ─────────────────────────────────────────────────────────────
  const handleSelectionChanged = useCallback(() => {
    const rows = gridRef.current?.api?.getSelectedRows() ?? []
    setSelectedCount(rows.length)
    onSelectionChanged?.(rows)
  }, [onSelectionChanged])

  // ── exports ───────────────────────────────────────────────────────────────
  const exportCsv = useCallback(() => {
    const params: CsvExportParams = {
      fileName: `${title.replace(/\s+/g, "_")}.csv`,
    }
    gridRef.current?.api?.exportDataAsCsv(params)
  }, [title])

  // ── merged grid options ───────────────────────────────────────────────────
  const mergedGridOptions = useMemo<GridOptions<TData>>(
    () => ({
      // Pagination
      pagination: true,
      paginationPageSize: pageSize,
      paginationPageSizeSelector: false, // we handle it ourselves
      suppressPaginationPanel: true,

      // Sorting / filtering
      enableAdvancedFilter: false,
      quickFilterText: searchText,

      // Row interactions
      rowSelection: rowSelection ?? {
        mode: "multiRow",
        checkboxes: true,
        headerCheckbox: true,
      },
      suppressCellFocus: false,

      // Animate
      animateRows: true,

      // Copy
      enableCellTextSelection: true,

      // Column defaults
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        floatingFilter: false,
        minWidth: 80,
        ...(gridOptions.defaultColDef ?? {}),
      },

      // No-rows overlay
      noRowsOverlayComponent: () => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: "2rem",
            color: "var(--color-text-secondary)",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.4"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <span style={{ fontSize: 13 }}>{noRowsText}</span>
        </div>
      ),

      // Status bar
      statusBar: {
        statusPanels: [
          { statusPanel: "agTotalAndFilteredRowCountComponent", align: "left" },
          { statusPanel: "agSelectedRowCountComponent", align: "left" },
          { statusPanel: "agAggregationComponent", align: "right" },
        ],
      },

      // Spread caller overrides last
      ...gridOptions,

      // Event handlers (merge with caller's)
      onGridReady: handleGridReady,
      onSelectionChanged: handleSelectionChanged,
      onRowClicked: onRowClicked
        ? (e) => e.data && onRowClicked(e.data)
        : undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageSize, searchText, rowSelection, noRowsText, gridOptions]
  )

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div
        style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 6,
          height: "100vh",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
        className="h-screen"
      >
        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            borderBottom: "0.5px solid var(--color-border-tertiary)",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* Left: search + title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flex: 1,
              minWidth: 0,
            }}
          >
            {showSearch && (
              <div
                style={{
                  position: "relative",
                  minWidth: 220,
                  maxWidth: 320,
                  flex: "0 0 auto",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-secondary)",
                    pointerEvents: "none",
                  }}
                >
                  <Search />
                </span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search records…"
                  style={{
                    width: "100%",
                    paddingLeft: 30,
                    paddingRight: searchText ? 28 : 10,
                    paddingTop: 7,
                    paddingBottom: 7,
                    fontSize: 13,
                    border: "0.5px solid var(--color-border-secondary)",
                    borderRadius: 8,
                    background: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {searchText && (
                  <button
                    onClick={() => handleSearch("")}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      lineHeight: 1,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <X />
                  </button>
                )}
              </div>
            )}

            <div
              style={{ display: "flex", flexDirection: "column", minWidth: 0 }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </span>
              {selectedCount > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-info)",
                    fontWeight: 500,
                  }}
                >
                  {selectedCount} row{selectedCount !== 1 ? "s" : ""} selected
                </span>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            {showRefresh && (
              <ToolBtn
                onClick={handleRefresh}
                title="Refresh"
                spinning={isRefreshing}
              >
                <span
                  style={{
                    display: "inline-block",
                    transition: "transform 0.6s ease",
                    transform: isRefreshing ? "rotate(360deg)" : "none",
                  }}
                >
                  <RefreshCcw />
                </span>
                <span>Refresh</span>
              </ToolBtn>
            )}

            {showExportCsv && (
              <ToolBtn onClick={exportCsv} title="Export CSV">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
                <span>CSV</span>
              </ToolBtn>
            )}

            {/* custom buttons from parent */}
            {toolbarButtons.map((btn) => (
              <ToolBtn
                key={btn.key}
                onClick={() =>
                  gridRef.current?.api && btn.onClick(gridRef.current.api)
                }
                title={btn.label}
                variant={btn.variant}
              >
                {btn.icon}
                <span>{btn.label}</span>
              </ToolBtn>
            ))}
          </div>
        </div>

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        <div
          style={{ height: gridHeight, width: "100%", position: "relative" }}
        >
          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                background: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LoadingSpinner />
            </div>
          )}
          <AgGridReact<TData>
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            theme={gridTheme}
            {...mergedGridOptions}
          />
        </div>

        {/* ── Footer / Pagination controls ─────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            borderTop: "0.5px solid var(--color-border-tertiary)",
            fontSize: 12,
            color: "var(--color-text-secondary)",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span>
            {rowData.length.toLocaleString()} total row
            {rowData.length !== 1 ? "s" : ""}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span>Rows per page:</span>
            <div style={{ display: "flex", gap: 4 }}>
              {pageSizeOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => handlePageSizeChange(size)}
                  style={{
                    padding: "3px 9px",
                    fontSize: 12,
                    fontFamily: "inherit",
                    border: "0.5px solid",
                    borderColor:
                      pageSize === size
                        ? "#3b5bdb"
                        : "var(--color-border-secondary)",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: pageSize === size ? "#eef1ff" : "transparent",
                    color:
                      pageSize === size
                        ? "#3b5bdb"
                        : "var(--color-text-secondary)",
                    fontWeight: pageSize === size ? 600 : 400,
                    transition: "all 0.15s",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
