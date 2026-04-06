import { CommonTable } from "../shared/CommonTable";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";
import type { AccessRequest, AccessItem } from "../../lib/types";

interface ITAllRequestsTableProps {
  data: AccessRequest[];
  isLoading: boolean;
  onView: (request: AccessRequest) => void;
}

export function ITAllRequestsTable({ data, isLoading, onView }: ITAllRequestsTableProps) {

  const columns = [
    {
      header: "Request ID",
      cell: (request: AccessRequest) => request.id,
    },
    {
      header: "Employee",
      cell: (request: AccessRequest) => request.requesterName || "N/A",
    },
    {
      header: "Department",
      cell: (request: AccessRequest) => request.requesterDept || "N/A",
    },
    {
      header: "Items",
      cell: (request: AccessRequest) => request.items?.length || 0,
    },
    {
      header: "Status",
      cell: (request: AccessRequest) => {
        const statuses = request.items?.map((item: AccessItem) => item.status).filter(Boolean);
        const uniqueStatuses = [...new Set(statuses)];
        return uniqueStatuses.length > 0 ? uniqueStatuses.join(", ") : "Unknown";
      },
    },
    {
      header: "Actions",
      cell: (request: AccessRequest) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(request)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      ),
    },
  ];

  const rowToSearchString = (request: AccessRequest) =>
    `${request.requesterName} ${request.id} ${request.items?.map((item: AccessItem) => item.system).join(" ")}`;

  return (
    <CommonTable
      data={data}
      isLoading={isLoading}
      rowKey={(request) => request.id}
      columns={columns}
      rowToSearchString={rowToSearchString}
      searchPlaceholder="Search by employee, request ID, or system..."
    />
  );
}