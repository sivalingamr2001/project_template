const API_URL =
  import.meta.env.VITE_API_URL ?? "/api"

export type AccessRequestItemPayload = {
  accessType: number
  confirmAccessTypeByHOD: number
  folderPath: string
  reason: string
}

export type AccessRequestFormPayload = {
  accessReqId?: number
  empId: number
  isAgree: boolean
  items: AccessRequestItemPayload[]
  itsrNo: string
  reqTo: number
}

export async function createAccessRequest(payload: AccessRequestFormPayload) {
  const response = await fetch(`${API_URL}/access-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Unable to create access request.")
  }

  return response.json()
}
