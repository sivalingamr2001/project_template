import { useMemo, useState } from "react"

import CreateRequestModal from "./components/CreateRequestModal"
import CommonTable from "./components/CommonTable"
import HeaderBar from "./components/HeaderBar"
import PageSection from "./components/PageSection"
import RequestExpandedRow from "./components/RequestExpandedRow"
import StatsGrid from "./components/StatsGrid"
import { useAccessWorkspace } from "./hooks/useAccessWorkspace"
import { requestColumns } from "./utils/tableColumns"

function DashboardPage() {
  const { errorMessage, isLoading, refetch, searchRequests, summaryCards } =
    useAccessWorkspace("dashboard")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const filteredRequests = useMemo(
    () => searchRequests(searchValue),
    [searchRequests, searchValue]
  )

  return (
    <div className="space-y-4">
      <StatsGrid cards={summaryCards} />
      <PageSection title="My Requests" description="">
        <div className="mb-4">
          <HeaderBar
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            onRefresh={refetch}
            onCreate={() => setIsModalOpen(true)}
          />
        </div>
        {errorMessage ? (
          <p className="mb-4 text-sm text-destructive">{errorMessage}</p>
        ) : null}
        <CommonTable
          columns={requestColumns}
          getRowId={(row) => row.accessReqId}
          pageSize={5}
          renderExpandedRow={(row) => <RequestExpandedRow row={row} />}
          rows={isLoading ? [] : filteredRequests}
          emptyMessage={
            isLoading
              ? "Loading access requests..."
              : "No requests matched your search."
          }
        />
      </PageSection>
      <CreateRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  )
}

export default DashboardPage
