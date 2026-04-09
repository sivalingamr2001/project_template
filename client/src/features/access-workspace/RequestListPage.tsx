import { Link } from "react-router-dom"
import CommonTable from "./components/CommonTable"
import PageSection from "./components/PageSection"
import { useAccessWorkspace } from "./hooks/useAccessWorkspace"
import type { QueueMode } from "./types"
import { requestColumns } from "./utils/tableColumns"

type RequestListPageProps = {
  description: string
  mode: QueueMode
  title: string
}

function RequestListPage({ description, mode, title }: RequestListPageProps) {
  const { errorMessage, isLoading, requests } = useAccessWorkspace(mode)

  return (
    <PageSection title={title} description={description}>
      {errorMessage ? (
        <p className="mb-4 text-sm text-destructive">{errorMessage}</p>
      ) : null}
      <CommonTable
        columns={requestColumns}
        getRowId={(row) => row.accessReqId}
        pageSize={5}
        rows={isLoading ? [] : requests}
        renderExpandedRow={(row) => (
          <div className="m-2 rounded-lg border border-dashed border-border bg-muted/30 p-4">
            {/* Table Header for Child Items */}
            <div className="mb-2 grid grid-cols-4 gap-4 px-2 text-[10px] font-bold text-muted-foreground uppercase">
              <span>Folder Path</span>
              <span>Access Type</span>
              <span>Reason</span>
              <span>Actions</span>
            </div>

            {/* Render accessItems from the parent record */}
            <div className="space-y-1">
              {row.accessItems?.map((item: any) => (
                <div
                  key={item.accessItemId}
                  className="grid grid-cols-4 gap-4 rounded border border-border/50 bg-background p-2 text-xs"
                >
                  <span className="font-mono break-all text-primary">
                    {item.folderPath}
                  </span>
                  <span>{String(item.accessType)}</span>
                  <span className="line-clamp-1 text-muted-foreground italic">
                    {item.reason}
                  </span>
                  <span>
                    <Link
                      to={`/requests/${row.accessReqId}/items/${item.accessItemId}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Details
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </span>
                </div>
              ))}

              {/* Fallback if no items exist */}
              {(!row.accessItems || row.accessItems.length === 0) && (
                <p className="p-2 text-xs text-muted-foreground">
                  No access items found.
                </p>
              )}
            </div>
          </div>
        )}
        emptyMessage={isLoading ? "Loading..." : "No requests found."}
      />
    </PageSection>
  )
}

export default RequestListPage
