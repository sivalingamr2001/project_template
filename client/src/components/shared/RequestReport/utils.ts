import type { AccessRequest, AccessTypes } from "@/lib/types"

export function getAccessTypeLabel(accessType: AccessTypes | undefined) {
  if (accessType === "ReadAndWrite") return "Read & Write"
  if (accessType === "ReadOnly") return "Read-Only"
  return "Not Applicable"
}

export function getStatusVariant(status: AccessRequest["status"]) {
  if (status === "Approved") return "success"
  if (status === "Rejected") return "destructive"
  return "warning"
}

