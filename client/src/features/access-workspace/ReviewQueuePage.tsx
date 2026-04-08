import CommonTable from "./components/CommonTable"
import PageSection from "./components/PageSection"
import RequestExpandedRow from "./components/RequestExpandedRow"
import { useAccessWorkspace } from "./hooks/useAccessWorkspace"
import type { QueueMode } from "./types"
import { requestColumns } from "./utils/tableColumns"

type ReviewQueuePageProps = {
  description: string
  mode: QueueMode
  title: string
}

function ReviewQueuePage({ description, mode, title }: ReviewQueuePageProps) {
  const { errorMessage, isLoading, requests } = useAccessWorkspace(mode)

  return (
    <PageSection title={title} description={description}>
      {errorMessage ? (
        <p className="mb-4 text-sm text-destructive">{errorMessage}</p>
      ) : null}
      <CommonTable
        columns={requestColumns}
        getRowId={(row) => row.accessReqId}
        pageSize={10}
        renderExpandedRow={(row) => <RequestExpandedRow row={row} />}
        rows={isLoading ? [] : requests}
        emptyMessage={
          isLoading
            ? "Loading access requests..."
            : "No requests are available in this queue."
        }
      />
    </PageSection>
  )
}

export default ReviewQueuePage
