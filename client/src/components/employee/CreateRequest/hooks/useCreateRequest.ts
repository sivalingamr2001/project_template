import { useState } from "react"
import { toast } from "sonner"
import type { AccessItemForm } from "../types"
import type { AccessRequestFormPayload } from "@/lib/access-request-api"

export function useCreateRequest(
  currentUserId: string | number | undefined,
  onSuccess: () => void,
  onAddRequest: (payload: AccessRequestFormPayload) => Promise<void>
) {
  const [items, setItems] = useState<AccessItemForm[]>([
    { id: Date.now(), system: "", accessType: "Read only", reason: "", durationDays: 365 },
  ])
  const [submitting, setSubmitting] = useState(false)

  const handleAddItem = () => {
    setItems((current) => [
      ...current,
      { id: Date.now() + current.length, system: "", accessType: "Read only", reason: "", durationDays: 365 },
    ])
  }

  const handleRemoveItem = (id: number) => {
    if (items.length > 1) {
      setItems((current) => current.filter((item) => item.id !== id))
    }
  }

  const handleItemChange = (id: number, field: keyof AccessItemForm, value: string | number) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const validate = (): boolean => {
    if (!currentUserId) {
      toast.error("User session not available")
      return false
    }
    if (items.some((item) => !item.system || !item.accessType || !item.reason)) {
      toast.error("Please fill in all fields")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setSubmitting(true)
    try {
      const payload: AccessRequestFormPayload = {
        empId: typeof currentUserId === "string" ? parseInt(currentUserId) : currentUserId ?? 0,
        itsrNumber: "",
        isAgreed: true,
        details: items.map((item) => ({
          folderName: item.system,
          accessType: item.accessType,
          reason: item.reason,
          durationDays: item.durationDays,
        })),
      }
      await onAddRequest(payload)
      toast.success("Request created successfully!")
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Failed to create request")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    items,
    submitting,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleSubmit,
  }
}
