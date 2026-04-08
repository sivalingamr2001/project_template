import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

import type {
  AccessRequest,
  AuditLogItem,
  EmployeeRecord,
  TableColumn,
} from "../types"

export const requestColumns: TableColumn<AccessRequest>[] = [
  {
    key: "request",
    header: "Request",
    render: (row) => (
      <div>
        <p className="font-semibold">{row.accessReqId}</p>
        <p className="text-sm text-muted-foreground">
          Emp #{row.empId} • ReqTo #{row.reqTo}
        </p>
      </div>
    ),
  },
  {
    key: "folder",
    header: "Folder",
    render: (row) => (
      <div>
        <p className="font-medium break-all">{row.folderPath}</p>
        <p className="text-sm text-muted-foreground">{row.reason}</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <div>
        <p>{row.status}</p>
        <p className="text-sm text-muted-foreground">{row.aggregateStatus}</p>
      </div>
    ),
  },
  { key: "access", header: "Access", render: (row) => row.accessType },
  { key: "itsr", header: "ITSR", render: (row) => row.itsrNo ?? "Unassigned" },
  {
    key: "action",
    header: "Action",
    render: (row) => (
      <Button asChild size="sm" variant="outline">
        <Link to={`/requests/${row.accessReqId}`}>View</Link>
      </Button>
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
