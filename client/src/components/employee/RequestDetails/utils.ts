import type { AccessRequest } from "@/lib/types"
import { daysBetween } from "@/lib/utils"
import type { AccessRequestFormPayload } from "@/lib/access-request-api"
import type { SelectedItem, WorkflowFlags, WorkflowStep } from "./types"

export function getBackPage(role: string | null) {
  if (role === "HOD") return "HOD_APPROVALS"
  if (role === "IT") return "IT_QUEUE"
  return "EMPLOYEE_DASHBOARD"
}

export function buildResubmitPayload(request: AccessRequest): AccessRequestFormPayload {
  return {
    empId: request.requesterId,
    itsrNumber: request.ticketNumber ?? "",
    isAgreed: true,
    details: request.items.map((item) => ({
      folderName: item.system,
      accessType: item.accessType === "ReadAndWrite" ? "Read and Write" : "Read only",
      reason: item.reason ?? request.rejectionReason ?? "Resubmitted request",
      durationDays: Math.max(30, daysBetween(request.requestedAt, item.expiresAt)),
    })),
  }
}

export function getWorkflowFlags(item: SelectedItem): WorkflowFlags {
  const itemStatuses = item.approvalHistory.map((h) => h.action)
  return {
    hodStageCompleted: item.status !== "PendingHOD",
    itStageCompleted: item.status === "Approved",
    rejectedAtHOD: itemStatuses.includes("HODRejected"),
    rejectedAtIT: itemStatuses.includes("ITRejected"),
  }
}

export function getWorkflowSteps(item: SelectedItem): WorkflowStep[] {
  const flags = getWorkflowFlags(item)
  const isExpired = item.status === "Expired"
  const isRevoked = item.status === "Revoked"
  const endStep =
    isExpired || isRevoked
      ? [{ label: isExpired ? "Expired" : "Revoked", status: "failed" as const, description: isExpired ? "Access item has expired and needs renewal." : "Access item was revoked by IT." }]
      : []
  return [
    { label: "Submitted", status: "complete", description: "Request created and sent for review." },
    { label: "HOD Approval", status: flags.rejectedAtHOD ? "failed" : flags.hodStageCompleted ? "complete" : item.status === "PendingHOD" ? "active" : "pending", description: "HOD checks the business need." },
    { label: "IT Approval", status: flags.rejectedAtIT ? "failed" : flags.itStageCompleted ? "complete" : item.status === "PendingIT" ? "active" : "pending", description: "IT finalizes infrastructure access." },
    ...endStep,
  ]
}

export function getStepClasses(status: WorkflowStep["status"]) {
  if (status === "complete") return "border-primary bg-primary/10 text-primary"
  if (status === "active") return "border border-primary text-primary"
  if (status === "failed") return "border-destructive bg-destructive/10 text-destructive"
  return "border border-border text-muted-foreground"
}

