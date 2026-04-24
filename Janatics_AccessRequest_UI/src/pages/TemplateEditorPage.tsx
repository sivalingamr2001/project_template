import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { TemplateEditor } from "@/features/budget/components/TemplateEditor"
import {
  TEMPLATE_SESSION_KEY,
  type TemplateCategory,
} from "@/features/budget/utils/budgetTemplates"

type SavedTemplatePayload = {
  name: string
  categories: TemplateCategory[]
}

export default function TemplateEditorPage() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveTemplate = (payload: SavedTemplatePayload) => {
    setIsSaving(true)
    try {
      // Save template to sessionStorage or API as needed
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          TEMPLATE_SESSION_KEY,
          JSON.stringify(payload.categories)
        )
      }
      // Navigate back to budget template page after saving
      navigate("/budget-template")
    } catch (error) {
      console.error("Error saving template:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate("/budget-template")
  }

  return (
      <CardContent className="p-0">
        <TemplateEditor
          isOpen={true}
          onClose={handleCancel}
          onSave={handleSaveTemplate}
          onBack={handleCancel}
        />
      </CardContent>
  )
}
