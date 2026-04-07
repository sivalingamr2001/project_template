import { useState } from "react"
import { useApp } from "@/context/AppContext"
import type { AccessRequestFormPayload } from "@/lib/access-request-api"
import type { NewRequestFormProps } from "../types"

export function useNewRequestForm({ onSubmit }: Pick<NewRequestFormProps, "onSubmit">) {
  const { currentUser } = useApp()

  const [formData, setFormData] = useState<AccessRequestFormPayload>({
    empId: currentUser?.employeeId ?? currentUser?.id ?? 0,
    itsrNumber: "",
    isAgreed: false,
    details: [
      {
        folderName: "",
        accessType: "Read only",
        reason: "",
        durationDays: 365,
      },
    ],
  })

  const handleBaseChange = (
    field: keyof AccessRequestFormPayload,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDetailChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => {
      const newDetails = [...prev.details]
      newDetails[index] = { ...newDetails[index], [field as any]: value }
      return { ...prev, details: newDetails }
    })
  }

  const handleAddDetail = () => {
    setFormData((prev) => ({
      ...prev,
      details: [
        ...prev.details,
        {
          folderName: "",
          accessType: "Read only",
          reason: "",
          durationDays: 30,
        },
      ],
    }))
  }

  const handleRemoveDetail = (index: number) => {
    if (formData.details.length === 1) {
      return
    }

    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.isAgreed) {
      return
    }

    onSubmit({
      ...formData,
      empId: currentUser?.employeeId ?? currentUser?.id ?? formData.empId,
    })
  }

  return {
    formData,
    handleBaseChange,
    handleDetailChange,
    handleAddDetail,
    handleRemoveDetail,
    handleSubmit,
  }
}
