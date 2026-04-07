import { useApp } from "@/hooks/useApp"
import { Card, CardContent } from "../../ui/card"
import { useHODAllRequests } from "../useHODAllRequests"
import { HODAllRequestsTable } from "./HODAllRequestsTable"

export function HODAllRequestsTab() {
  const { data = [], isLoading } = useHODAllRequests()
  const { setSelectedRequestId, setSelectedAccessItemId, setCurrentPage } =
    useApp()

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Requests</h2>
        </div>
        <HODAllRequestsTable
          data={data}
          isLoading={isLoading}
          onView={(requestId, itemId) => {
            setSelectedRequestId(requestId)
            setSelectedAccessItemId(itemId)
            setCurrentPage("EMPLOYEE_REQUEST_DETAIL")
          }}
        />
      </CardContent>
    </Card>
  )
}
