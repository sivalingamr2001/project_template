import type { AccessRequest } from "@/lib/types"

export interface StatusStep {
  key: string
  label: string
}

export const STATUS_STEPS: StatusStep[] = [
  { key: "PendingHOD", label: "Submitted" },
  { key: "PendingIT", label: "HOD Review" },
  { key: "Approved", label: "IT Review" },
  { key: "Expired", label: "Expired" },
  { key: "Revoked", label: "Revoked" },
]

export function getCurrentStepIndex(status?: string): number {
  const index = STATUS_STEPS.findIndex((step) => step.key === status)
  return index >= 0 ? index : 0
}
