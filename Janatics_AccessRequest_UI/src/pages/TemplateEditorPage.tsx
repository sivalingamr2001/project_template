import { TemplateEditor } from "@/features/budget/components/TemplateEditor"
import {
  budgetTemplateApi,
  type TemplateCategory,
} from "@/features/budget/utils/budgetTemplates"
import { CardContent } from "@/shared/components/ui/card"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

type SavedTemplatePayload = {
  name: string
  categories: TemplateCategory[]
}

export default function TemplateEditorPage() {
  const navigate = useNavigate()
  const { templateId } = useParams()
  const isEditMode = Boolean(templateId)

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [initialName, setInitialName] = useState("")
  const [initialCategories, setInitialCategories] = useState<TemplateCategory[]>(
    []
  )

  useEffect(() => {
    let isMounted = true

    const fetchTemplate = async () => {
      if (!templateId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await budgetTemplateApi.getById(Number(templateId))

        if (!isMounted) {
          return
        }

        setInitialName(response.data.data.name)
        setInitialCategories(response.data.data.structure)
      } catch (error) {
        toast.error("Unable to load template for editing")
        navigate("/budget-template", { replace: true })
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchTemplate()

    return () => {
      isMounted = false
    }
  }, [navigate, templateId])

  const handleSaveTemplate = async (payload: SavedTemplatePayload) => {
    setIsSaving(true)

    try {
      if (templateId) {
        await budgetTemplateApi.update(
          Number(templateId),
          payload.name,
          payload.categories
        )
        toast.success("Template updated")
      } else {
        await budgetTemplateApi.create(payload.name, payload.categories)
        toast.success("Template created")
      }

      navigate("/budget-template")
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error saving template"
      toast.error(errorMessage)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate("/budget-template")
  }

  if (isLoading) {
    return (
      <CardContent className="flex min-h-[360px] items-center justify-center p-6">
        <div className="text-sm text-muted-foreground">Loading template...</div>
      </CardContent>
    )
  }

  return (
    <CardContent className="p-0">
      <TemplateEditor
        isOpen={true}
        onClose={handleCancel}
        onSave={handleSaveTemplate}
        onBack={handleCancel}
        initialName={initialName}
        initialCategories={initialCategories}
        isSaving={isSaving}
        submitLabel={isEditMode ? "Update template" : "Save template"}
      />
    </CardContent>
  )
}
