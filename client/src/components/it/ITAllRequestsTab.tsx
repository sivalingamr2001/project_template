import { ITAllRequestsTable } from "./ITAllRequestsTable";
import { useITAllRequests } from "./useITAllRequests";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";
import { useApp } from "../../hooks/useApp";
import { useData } from "../../context/DataContext";
import { useState } from "react";

export function ITAllRequestsTab() {
  const { requests, isLoading, error } = useITAllRequests();
  const { setSelectedRequestId, setSelectedAccessItemId, setCurrentPage } = useApp();
  const { refreshData } = useData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Requests</h2>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <ITAllRequestsTable
        data={requests}
        isLoading={isLoading}
        onView={(request) => {
          setSelectedRequestId(request.id);
          // Select the first item of the request
          if (request.items && request.items.length > 0) {
            setSelectedAccessItemId(request.items[0].id);
          }
          setCurrentPage("EMPLOYEE_REQUEST_DETAIL");
        }}
      />
    </div>
  );
}