import React, { useId } from "react"
import type { DataGridState } from "../../types/DataGrid.types"

// ─── Icon primitives ─────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    style={{
      transition: "transform 0.6s linear",
      transform: spinning ? "rotate(360deg)" : "none",
    }}
  >
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
)

const FilterXIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M13.013 3H2l8 9.46V19l4 2v-8.54l.9-1.055" />
    <path d="m22 3-5 5" />
    <path d="m17 3 5 5" />
  </svg>
)

const DownloadIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

// ─── Shared button component ─────────────────────────────────────────────────

type BtnVariant = "default" | "ghost" | "danger" | "primary"

interface ToolBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  children: React.ReactNode
}

const variantStyles: Record<BtnVariant, React.CSSProperties> = {
  default: {
    background: "transparent",
    color: "var(--color-text-secondary)",
    border: "0.5px solid var(--color-border-secondary)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-secondary)",
    border: "0.5px solid transparent",
  },
  danger: {
    background: "transparent",
    color: "#c92a2a",
    border: "0.5px solid rgba(201,42,42,0.3)",
  },
  primary: {
    background: "#3b5bdb",
    color: "#fff",
    border: "none",
  },
}

const ToolBtn = React.forwardRef<HTMLButtonElement, ToolBtnProps>(
  ({ variant = "default", children, style, ...rest }, ref) => (
    <button
      ref={ref}
      className="datagrid-tool-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        fontSize: 12,
        fontFamily: "inherit",
        fontWeight: 500,
        borderRadius: 7,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "background 0.15s, opacity 0.15s",
        lineHeight: 1.4,
        ...variantStyles[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
)
ToolBtn.displayName = "ToolBtn"

// ─── Badge ───────────────────────────────────────────────────────────────────

const Badge = ({
  count,
  color = "#3b5bdb",
}: {
  count: number
  color?: string
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 18,
      height: 18,
      padding: "0 5px",
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 99,
      background: color,
      color: "#fff",
      lineHeight: 1,
    }}
  >
    {count}
  </span>
)

// ─── Search input ─────────────────────────────────────────────────────────────

interface SearchInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search all columns…",
}) => {
  const id = useId()
  return (
    <div
      role="search"
      className="datagrid-search"
      style={{ position: "relative", flex: "0 0 240px" }}
    >
      <label
        htmlFor={id}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
        }}
      >
        Search
      </label>
      <span
        style={{
          position: "absolute",
          left: 9,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--color-text-secondary)",
          pointerEvents: "none",
        }}
      >
        <SearchIcon />
      </span>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: "100%",
          paddingLeft: 30,
          paddingRight: value ? 28 : 10,
          paddingTop: 6,
          paddingBottom: 6,
          fontSize: 13,
          fontFamily: "inherit",
          border: "0.5px solid var(--color-border-secondary)",
          borderRadius: 8,
          background: "var(--color-background-secondary)",
          color: "var(--color-text-primary)",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#3b5bdb")}
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "var(--color-border-secondary)")
        }
      />
    </div>
  )
}

// ─── Main Toolbar ─────────────────────────────────────────────────────────────

export interface GridToolbarProps {
  title: string
  state: DataGridState

  showSearch: boolean
  showRefresh: boolean
  showClearFilters: boolean
  showExportCsv: boolean
  showSelectedCount: boolean

  toolbarLeft?: React.ReactNode
  toolbarRight?: React.ReactNode

  onQuickFilterChange: (v: string) => void
  onRefresh: () => void
  onClearFilters: () => void
  onExportCsv: () => void
}

export const GridToolbar: React.FC<GridToolbarProps> = ({
  title,
  state,
  showSearch,
  showRefresh,
  showClearFilters,
  showExportCsv,
  toolbarLeft,
  toolbarRight,
  onQuickFilterChange,
  onRefresh,
  onClearFilters,
  onExportCsv,
}) => {
  const { quickFilter, activeFiltersCount, isRefreshing } = state

  return (
    <div role="toolbar" aria-label={`${title} toolbar`}>
      {/* ── main toolbar row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 0px",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* Left */}
        <div
          className="datagrid-toolbar-left"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            minWidth: 0,
          }}
        >
          {showSearch && (
            <>
              <SearchInput value={quickFilter} onChange={onQuickFilterChange} />
            </>
          )}
          {toolbarLeft}
        </div>

        {/* Right */}
        <div
          className="datagrid-toolbar-right"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {toolbarRight}

          {showClearFilters && (
            <ToolBtn
              variant="ghost"
              onClick={onClearFilters}
              disabled={activeFiltersCount === 0 && !quickFilter}
              title="Clear all filters"
              style={{
                opacity: activeFiltersCount === 0 && !quickFilter ? 0.4 : 1,
              }}
            >
              <FilterXIcon />
              <span className="datagrid-btn-label">Clear filters</span>
              {activeFiltersCount > 0 && (
                <Badge count={activeFiltersCount} color="#e67700" />
              )}
            </ToolBtn>
          )}

          {showExportCsv && (
            <ToolBtn
              variant="default"
              onClick={onExportCsv}
              title="Export visible data as CSV"
            >
              <DownloadIcon />
              <span className="datagrid-btn-label">Export CSV</span>
            </ToolBtn>
          )}

          {showRefresh && (
            <ToolBtn
              variant="primary"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Reload data"
              aria-label={isRefreshing ? "Refreshing…" : "Refresh data"}
            >
              <RefreshIcon spinning={isRefreshing} />
              <span className="datagrid-btn-label">
                {isRefreshing ? "Refreshing…" : "Refresh"}
              </span>
            </ToolBtn>
          )}
        </div>
      </div>
    </div>
  )
}
