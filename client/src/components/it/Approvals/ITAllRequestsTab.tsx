import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useData } from "@/context/DataContext"
import { useITAllRequests } from "./hooks/useITAllRequests"
import { ITAllRequestsTable } from "./components/ITAllRequestsTable"

export function ITAllRequestsTab() {
  const { data = [], isLoading } = useITAllRequests()
  const { refreshData } = useData()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        <ITAllRequestsTable
          data={data}
          isLoading={isLoading}
          onView={(requestId, itemId) => {
            // Navigation logic would be handled by parent component
            console.log("View request:", requestId, itemId)
          }}
        />
      </CardContent>
    </Card>
  )
}

function Header({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void
  isRefreshing: boolean
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">All Requests</h2>
      <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  )
}
