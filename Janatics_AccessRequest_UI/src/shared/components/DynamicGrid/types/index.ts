import type { GridOptions, GridReadyEvent } from "ag-grid-community"

export interface ReusableAgGridProps<TData> {
  title?: string
  rowData: TData[]
  columnDefs: any[]
  gridOptions?: GridOptions<TData>
  pageSizeOptions?: number[]
  defaultPageSize?: number
  showSearch?: boolean
  showRefresh?: boolean
  showExportCsv?: boolean
  autoSizeMode?: "fit" | "content"
  toolbarButtons?: Array<{
    key: string
    label: string
    icon: React.ReactNode
    onClick: (api: any) => void
    variant?: "default" | "danger" | "success"
  }>
  onGridReady?: (params: GridReadyEvent<TData>) => void
  onSelectionChanged?: (selectedRows: TData[]) => void
  onRowClicked?: (data: TData) => void
  gridHeight?: string | number
  rowSelection?: any
  loading?: boolean
  noRowsText?: string
}
