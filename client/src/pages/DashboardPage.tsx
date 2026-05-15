import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef, CellContext } from "@tanstack/react-table";
import { DynamicGrid } from "@/components/DynamicGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/date-format";
import { useRequestionApi } from "@/core/api/useRequestionApi";
import type { RequisitionDocument } from "@/types";

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const getDocStatus = (doc: RequisitionDocument): string => {
  if (doc.approvedBy) return "approved";
  if (doc.checkedBy) return "pending";
  return "draft";
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<RequisitionDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRequisitions = async () => {
    setIsLoading(true);
    try {
      const requisitions = await useRequestionApi.fetchRequisitions();
      setData(requisitions);
    } catch (error) {
      console.error("Failed to load requisitions:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRequisitions();
  }, []);

  const columns: ColumnDef<RequisitionDocument>[] = useMemo(
    () => [
      {
        accessorKey: "recNo",
        header: "Rec. No",
        cell: (info: CellContext<RequisitionDocument, unknown>) => (
          <span className="font-medium">{info.row.original.recNo}</span>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: (info: CellContext<RequisitionDocument, unknown>) =>
          formatDate(info.row.original.date),
      },
      {
        accessorKey: "productName",
        header: "Product Name",
      },
      {
        accessorKey: "projectNo",
        header: "Project No",
      },
      {
        id: "status",
        header: "Status",
        cell: (info: CellContext<RequisitionDocument, unknown>) => (
          <Badge className={getStatusColor(getDocStatus(info.row.original))}>
            {getDocStatus(info.row.original)}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Action",
        cell: (info: CellContext<RequisitionDocument, unknown>) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/form-details/${info.row.original.recNo}`)}
          >
            View
          </Button>
        ),
      },
    ],
    [navigate],
  );

  const handleRefresh = () => {
    void loadRequisitions();
  };

  const handleCreate = () => {
    navigate("/form-details");
  };

  return (
    <div className="p-6">
      <DynamicGrid<RequisitionDocument>
        columns={columns}
        data={data}
        title="Requisitions"
        globalFilterPlaceholder="Search..."
        canColumnFilter={true}
        canGlobalFilter={true}
        canColumnVisibility={true}
        canSorting={true}
        canPagination={true}
        canRowSelection={false}
        pageSize={10}
        emptyMessage="No documents found"
        onRefresh={handleRefresh}
        onCreate={handleCreate}
      />
    </div>
  );
};
