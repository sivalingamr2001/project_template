import { useEffect, useState } from "react"

import type { AccessRequestFormPayload } from "@/lib/access-request-api"

import { createDefaultPayload } from "../utils/accessRequestForm"

export function useAccessRequestForm(
  employeeId: number,
  initialData?: AccessRequestFormPayload,
  mode: "create" | "edit" = "create"
) {
  const [formData, setFormData] = useState<AccessRequestFormPayload>(
    initialData ?? createDefaultPayload(employeeId)
  )

  useEffect(() => {
    if (initialData) setFormData(initialData)
    if (!initialData && mode === "create")
      setFormData(createDefaultPayload(employeeId))
  }, [employeeId, initialData, mode])

  return { formData, setFormData }
}
