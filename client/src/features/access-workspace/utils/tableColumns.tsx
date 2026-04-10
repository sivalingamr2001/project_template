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
          {row.empId === userData?.employeeId
            ? userData?.name
            : `Emp #${row.empId}`}
        </span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => row.status,
  },
  {
    key: "aggregateStatus",
    header: "OverallStatus",
    render: (row) => (
      <p className="text-sm text-muted-foreground">{row.aggregateStatus}</p>
    ),
  },
  { key: "itsr", header: "ITSR", render: (row) => row.itsrNo ?? "--" },
  {
    key: "view",
    header: "View",
    render: (row) => (
      <Link
        className="text-sm font-semibold text-primary hover:underline"
        to={`/requests/${row.accessReqId}`}
      >
        View
      </Link>
    ),
  },
]

export const employeeColumns: TableColumn<EmployeeRecord>[] = [
  {
    key: "employee",
    header: "Employee",
    render: (row) => (
      <div>
        <p className="font-semibold">{row.name}</p>
        <p className="text-sm text-muted-foreground">{row.email}</p>
      </div>
    ),
  },
  { key: "id", header: "Employee ID", render: (row) => row.employeeId },
  {
    key: "department",
    header: "Department",
    render: (row) => row.departmentName,
  },
  { key: "role", header: "Role", render: (row) => row.role },
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
