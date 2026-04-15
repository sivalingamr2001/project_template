import type { AuditLogItem, EmployeeRecord, NotificationItem } from "../types"

export const NOTIFICATIONS: NotificationItem[] = [
  {
    auditId: 1,
    accessReqId: 4108,
    eventType: "request.submitted",
    message: "Your request is waiting for HOD approval.",
    recipientRole: "User",
    createdOn: "2026-04-07 09:30",
    isRead: false,
  },
  {
    auditId: 2,
    accessReqId: 4108,
    eventType: "hod.review.pending",
    message: "A finance request needs HOD review.",
    recipientRole: "Hod",
    createdOn: "2026-04-07 09:20",
    isRead: false,
  },
  {
    auditId: 3,
    accessReqId: 4107,
    eventType: "it.review.pending",
    message: "A request is waiting in the IT queue.",
    recipientRole: "Admin",
    createdOn: "2026-04-07 08:10",
    isRead: false,
  },
]

export const EMPLOYEES: EmployeeRecord[] = [
  {
    userId: 1,
    employeeId: 1001,
    name: "Anitha",
    departmentName: "Finance",
    role: "User",
    email: "anitha@company.com",
  },
  {
    userId: 2,
    employeeId: 2201,
    name: "Meera",
    departmentName: "Finance",
    role: "Hod",
    email: "meera@company.com",
  },
  {
    userId: 3,
    employeeId: 3001,
    name: "Arun",
    departmentName: "IT Infrastructure",
    role: "Admin",
    email: "arun@company.com",
  },
]

export const AUDIT_LOGS: AuditLogItem[] = [
  {
    auditId: 41,
    actor: "Anitha",
    eventType: "request.submitted",
    requestId: 4108,
    createdOn: "2026-04-07 09:30",
    details: "Submitted folder access for finance close evidence.",
  },
  {
    auditId: 42,
    actor: "Meera",
    eventType: "hod.approved",
    requestId: 4102,
    createdOn: "2026-04-05 11:05",
    details: "Approved tax folder review request and routed to IT.",
  },
  {
    auditId: 43,
    actor: "Arun",
    eventType: "it.provisioned",
    requestId: 4105,
    createdOn: "2026-04-06 17:40",
    details: "Mapped access to ITSR-88421 and provisioned access.",
  },
]
