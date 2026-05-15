import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { formatDate } from "../../utils/date-format";
import type { RequisitionDocument } from "../../types";

interface RequisitionTableProps {
  documents: RequisitionDocument[];
  onSelect: (doc: RequisitionDocument) => void;
}

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

export function RequisitionTable({ documents, onSelect }: RequisitionTableProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500">No documents found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rec. No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Project No</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.recNo}>
              <TableCell className="font-medium">{doc.recNo}</TableCell>
              <TableCell>{formatDate(doc.date)}</TableCell>
              <TableCell>{doc.productName}</TableCell>
              <TableCell>{doc.projectNo}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(getDocStatus(doc))}>
                  {getDocStatus(doc)}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => onSelect(doc)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
