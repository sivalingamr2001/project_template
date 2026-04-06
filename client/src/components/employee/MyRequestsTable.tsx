import { Plus, Eye } from 'lucide-react'
import { CommonTable } from '../shared/CommonTable'
import { StatusBadge } from '../shared/StatusBadge'
import { formatDate } from '../../lib/utils'
import type { AccessRequest, AccessItem } from '../../lib/types'
import { useData } from '../../context/DataContext'
import { Button } from '../ui/button'

type AccessItemRow = {
  request: AccessRequest
  item: AccessItem
}

export function MyRequestsTable({
  data,
  isLoading,
  onViewDetail,
  onNewRequest,
}: {
  data: AccessRequest[]
  isLoading: boolean
  onViewDetail: (requestId: number, itemId: number) => void
  onNewRequest: () => void
}) {
  const { refreshData } = useData()
  const rows: AccessItemRow[] = data.flatMap((request) =>
    request.items.map((item) => ({ request, item }))
  )

  return (
    <CommonTable<AccessItemRow>
      data={rows}
      isLoading={isLoading}
      rowKey={(row) => row.item.id}
      columns={[
        {
          header: 'Request ID',
          cell: (row) => row.request.id,
        },
        {
          header: 'Access Item ID',
          cell: (row) => `#${row.item.id}`,
        },
        {
          header: 'Systems',
          cell: (row) => row.item.system,
        },
        {
          header: 'Access Types',
          cell: (row) => row.item.accessType,
        },
        {
          header: 'Created',
          cell: (row) => formatDate(row.item.requestedAt),
        },
        {
          header: 'Status',
          cell: (row) => <StatusBadge status={row.item.status} />,
        },
      ]}
      renderRowActions={(row) => (
        <Button
          className="inline-flex items-center rounded-lg border border-border bg-transparent px-3 py-1 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
          onClick={() => onViewDetail(row.request.id, row.item.id)}
          type="button"
          variant="default"
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
      )}
      rowToSearchString={(row) =>
        [
          row.request.id,
          row.item.id,
          row.item.system,
          row.item.accessType,
          row.item.status,
        ].join(' ')
      }
      onRefresh={refreshData}
      primaryAction={{
        label: 'New Request',
        icon: <Plus className="mr-2 h-4 w-4" />,
        onClick: onNewRequest,
      }}
      emptyMessage="No requests"
      searchPlaceholder="Search requests"
    />
  )
}
