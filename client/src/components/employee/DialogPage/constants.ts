import type { HODAccessTypes } from "@/lib/types"

export const hodApprovalOptions: Array<{ value: HODAccessTypes; label: string }> = [
  { value: "ReadOnly", label: "Read Only" },
  { value: "ReadAndWrite", label: "Read and Write" },
  { value: "HodOnly", label: "HOD Only" },
]

