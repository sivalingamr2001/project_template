import type { AccessRequestFormPayload } from "@/lib/access-request-api"

export const ACCESS_OPTIONS = [
  { label: "Not Applicable", value: 0 },
  { label: "Read only", value: 1 },
  { label: "Read and Write", value: 2 },
]

export function createDefaultPayload(
  employeeId: number,
  userHODId: number
): AccessRequestFormPayload {
  return {
    empId: employeeId,
    isAgree: false,
    items: [
      {
        accessType: 1,
        confirmAccessTypeByHOD: 0,
        folderPath: "",
        reason: "",
      },
    ],
    itsrNo: "",
    reqTo: userHODId ?? 0,
  } satisfies AccessRequestFormPayload
}
