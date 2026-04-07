import { useState, useCallback, useEffect } from "react"
import { useApp } from "@/hooks/useApp"
import type { AccessRequestFormPayload } from "@/lib/access-request-api"

interface UseNewRequestFormOptions {
  onSubmit: (values: AccessRequestFormPayload) => void
  mode?: "create" | "edit"
  initialData?: AccessRequestFormPayload
}

export function useNewRequestForm({
  onSubmit,
  mode = "create",
  initialData,
}: UseNewRequestFormOptions) {
  const { currentUser } = useApp()

  const getInitialFormData = useCallback((): AccessRequestFormPayload => {
    if (mode === "edit" && initialData) {
      return { ...initialData }
    }

    return {
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
    }
  }, [currentUser, mode, initialData])

  const [formData, setFormData] =
    useState<AccessRequestFormPayload>(getInitialFormData)

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({ ...initialData })
    }
  }, [initialData, mode])

  const handleBaseChange = useCallback(
    (
      field: keyof AccessRequestFormPayload,
      value: string | boolean | number
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleDetailChange = useCallback(
    (index: number, field: string, value: string | number) => {
      setFormData((prev) => {
        const newDetails = [...prev.details]
        newDetails[index] = { ...newDetails[index], [field as any]: value }
        return { ...prev, details: newDetails }
      })
    },
    []
  )

  const handleAddDetail = useCallback(() => {
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
  }, [])

  const handleRemoveDetail = useCallback((index: number) => {
    setFormData((prev) => {
      if (prev.details.length === 1) {
        return prev
      }

      return {
        ...prev,
        details: prev.details.filter((_, i) => i !== index),
      }
    })
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setFormData((prev) => {
        if (!prev.isAgreed) {
          return prev
        }

        onSubmit({
          ...prev,
          empId: currentUser?.employeeId ?? currentUser?.id ?? prev.empId,
        })
        return prev
      })
    },
    [currentUser, onSubmit]
  )

  return {
    formData,
    handleBaseChange,
    handleDetailChange,
    handleAddDetail,
    handleRemoveDetail,
    handleSubmit,
  }
}
