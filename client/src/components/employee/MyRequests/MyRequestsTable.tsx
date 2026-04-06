import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { CommonTable } from "@/components/shared/CommonTable"
import { formatDate } from "@/lib/utils"
import type { AccessRequest, AccessItem } from "@/lib/types"

interface RequestRow {
  request: AccessRequest
  item: AccessItem
}

interface MyRequestsTableProps {
  data: AccessRequest[]
  isLoading: boolean
  onViewDetail: (requestId: number, itemId: number) => void
  onNewRequest: () => void
}

export function MyRequestsTable({
  data,
  isLoading,
  onViewDetail,
  onNewRequest,
}: MyRequestsTableProps) {
  const rows: RequestRow[] = data.flatMap((request) =>
    request.items.map((item) => ({ request, item }))
  )

  return (
    <CommonTable<RequestRow>
      data={rows}
      isLoading={isLoading}
      rowKey={(row) => row.item.id}
      columns={getTableColumns()}
      renderRowActions={(row) => renderViewButton(row, onViewDetail)}
      rowToSearchString={(row) =>
        [row.request.id, row.item.id, row.item.system, row.item.accessType, row.item.status].join(" ")
      }
      primaryAction={{
        label: "New Request",
        onClick: onNewRequest,
      }}
      emptyMessage="No requests"
      searchPlaceholder="Search requests"
    />
  )
}

function getTableColumns() {
  return [
    {
      header: "Request ID",
      cell: (row: RequestRow) => row.request.id,
    },
    {
      header: "Item ID",
      cell: (row: RequestRow) => `#${row.item.id}`,
    },
    {
      header: "System",
      cell: (row: RequestRow) => row.item.system,
    },
    {
      header: "Access Type",
      cell: (row: RequestRow) => row.item.accessType,
    },
    {
      header: "Created",
      cell: (row: RequestRow) => formatDate(row.item.requestedAt),
    },
    {
      header: "Status",
      cell: (row: RequestRow) => <StatusBadge status={row.item.status} />,
    },
  ]
}

function renderViewButton(
  row: RequestRow,
  onViewDetail: (requestId: number, itemId: number) => void
) {
  return (
    <Button
      className="inline-flex items-center rounded-lg border border-border bg-transparent px-3 py-1 text-sm font-medium text-foreground transition hover:bg-accent"
      onClick={() => onViewDetail(row.request.id, row.item.id)}
      type="button"
      variant="default"
    >
      <Eye className="mr-2 h-4 w-4" />
      View
    </Button>
  )
}
