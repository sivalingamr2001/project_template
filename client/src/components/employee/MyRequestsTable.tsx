import { Plus, Eye } from 'lucide-react'
import { CommonTable } from '../shared/CommonTable'
import { StatusBadge } from '../shared/StatusBadge'
import { formatDate } from '../../lib/utils'
import type { AccessRequest } from '../../lib/types'
import { useData } from '../../context/DataContext'

export function MyRequestsTable({
  data,
  isLoading,
  onViewDetail,
  onNewRequest,
}: {
  data: AccessRequest[]
  isLoading: boolean
  onViewDetail: (id: number) => void
  onNewRequest: () => void
}) {
  const { refreshData } = useData()

  return (
    <CommonTable<AccessRequest>
      data={data}
      isLoading={isLoading}
      rowKey={(request) => request.id}
      columns={[
        {
          header: 'Request ID',
          cell: (request) => request.id,
        },
        {
          header: 'Systems',
          cell: (request) => request.items.map((item) => item.system).join(', '),
        },
        {
          header: 'Access Types',
          cell: (request) => request.items.map((item) => item.accessType).join(', '),
        },
        {
          header: 'Created',
          cell: (request) => formatDate(request.requestedAt),
        },
        {
          header: 'Status',
          cell: (request) => <StatusBadge status={request.status} />,
        },
      ]}
      renderRowActions={(request) => (
        <button
          className="inline-flex items-center rounded-lg border border-border bg-transparent px-3 py-1 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
          onClick={() => onViewDetail(request.id)}
          type="button"
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </button>
      )}
      rowToSearchString={(request) =>
        [
          request.id,
          request.items.map((item) => item.system).join(' '),
          request.items.map((item) => item.accessType).join(' '),
          request.status,
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
