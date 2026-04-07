import { RequestCard } from "./RequestCard"
import { RequestListEmptyState } from "./RequestListEmptyState"
import { RequestListHeader } from "./RequestListHeader"
import { STATUS_ICON_MAP, type RequestListProps } from "./RequestList.types"

export function RequestList({
  requests,
  onSelectRequest,
  onNewRequest,
}: RequestListProps) {
  const isEmpty = requests.length === 0

  const requestCards = requests.map((request) => {
    const handleSelect = () => onSelectRequest(request.id)
    return (
      <RequestCard
        key={request.id}
        request={request}
        statusIcon={STATUS_ICON_MAP[request.status]}
        onSelect={handleSelect}
      />
    )
  })

  return (
    <div className="space-y-4">
      <RequestListHeader onNewRequest={onNewRequest} />
      {isEmpty ? <RequestListEmptyState /> : <div className="grid gap-3">{requestCards}</div>}
    </div>
  )
}
