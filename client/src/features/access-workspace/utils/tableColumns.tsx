import { GetCurrentUser } from "@/lib/utils"
import type {
  AccessRequest,
  AuditLogItem,
  EmployeeRecord,
  TableColumn,
} from "../types"
import { Link } from "react-router-dom"

const userData = GetCurrentUser()

export const requestColumns: TableColumn<AccessRequest>[] = [
  {
    key: "ticketNumber",
    header: "Ticket Number",
    render: (row) => row.accessItems.map((item) => item.ticketNumber).join(", "),
  },
  {
    key: "folderPath",
    header: "Folder Path",
    render: (row) => {
      const [firstItem, ...remainingItems] = row.accessItems
      if (!firstItem) return "--"

      return remainingItems.length > 0
        ? `${firstItem.folderPath} (+${remainingItems.length} more)`
        : firstItem.folderPath
    },
  },
  {
    key: "request",
    header: "Request",
    render: (row) => (
      <div className="flex items-center gap-1.5 text-sm">
        <span className="font-semibold">REQ #{row.accessReqId}</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">
          {row.empId === userData?.userId
            ? userData?.name
            : `User #${row.empId}`}
        </span>
      </div>
    ),
  },
  { key: "itsr", header: "ITSR", render: (row) => row.itsrNo ?? "--" },
  {
    key: "status",
    header: "Status",
    render: (row) => {
      const status = row.accessItems[0]?.status || row.status
      const statusColors: Record<string, string> = {
        Approved: "bg-green-100 text-green-800",
        Rejected: "bg-red-100 text-red-800",
        Pending: "bg-yellow-100 text-yellow-800",
      }
      const colorClass = statusColors[status] || "bg-gray-100 text-gray-800"
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
        >
          {status}
        </span>
      )
    },
  },
  {
    key: "view",
    header: "View",
    render: (row) => (
      <Link
        className="text-sm font-semibold text-primary hover:underline"
        to={`/requests/${row.accessReqId}/items/${row.accessItems[0]?.accessItemId ?? "request"}`}
      >
        View
      </Link>
    ),
  },
]

export const employeeColumns: TableColumn<EmployeeRecord>[] = [
  { key: "userId", header: "User ID", render: (row) => row.userId },
  { key: "employeeId", header: "Employee ID", render: (row) => row.employeeId || "-" },
  {
    key: "employee",
    header: "Employee",
    render: (row) => (
      <div>
        <p className="font-semibold">{row.userName}</p>
        {row.email ? (
          <p className="text-sm text-muted-foreground">{row.email}</p>
        ) : (
          <p className="text-sm text-destructive">No Email</p>
        )}
      </div>
    ),
  },
  { key: "mobile", header: "Mobile", render: (row) => row.mobile || "-" },
  { key: "role", header: "Role", render: (row) => row.role },
  { key: "location", header: "Location", render: (row) => row.location || "-" },
  {
    key: "departmentName",
    header: "Department",
    render: (row) => (
      <div>
        <p className="font-semibold">{row.departmentName || "-"}</p>
        <p className="text-sm text-muted-foreground">{row.departmentId || "-"}</p>
      </div>
    ),
  },
  {
    key: "hod", header: "HOD", render: (row) => (
      <div>
        <p className="font-semibold">{row.hod || "-"}</p>
        <p className="text-sm text-muted-foreground">{row.hodId || "-"}</p>
      </div>
    )
  },
]

export const auditColumns: TableColumn<AuditLogItem>[] = [
  { key: "audit", header: "Audit ID", render: (row) => row.auditId },
  { key: "actor", header: "Actor", render: (row) => row.actor },
  { key: "event", header: "Event", render: (row) => row.eventType },
  { key: "request", header: "Request", render: (row) => row.requestId },
  { key: "created", header: "Created", render: (row) => row.createdOn },
  {
    key: "details",
    header: "Details",
    render: (row) => (
      <span className="text-muted-foreground">{row.details}</span>
    ),
  },
]
