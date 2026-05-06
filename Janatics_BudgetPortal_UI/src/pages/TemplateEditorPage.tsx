import { TemplateEditor } from "@/features/budget/components/TemplateEditor"
import {
  budgetTemplateApi,
  type TemplateCategory,
} from "@/features/budget/utils/budgetTemplates"
import { CardContent } from "@/shared/components/ui/card"
import { Spinner } from "@/shared/components/ui/spinner"
import useLoader from "@/shared/hooks/useLoader"
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

  const { loading: isSaving, withLoader: withSaveLoader } = useLoader()
  const { loading: isLoading, withLoader: withLoadLoader } = useLoader()
  const [initialName, setInitialName] = useState("")
  const [initialCategories, setInitialCategories] = useState<
    TemplateCategory[]
  >([])

  useEffect(() => {
    let isMounted = true

    const fetchTemplate = async () => {
      if (!templateId) {
        return
      }

      await withLoadLoader(async () => {
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
        }
      })
    }

    void fetchTemplate()

    return () => {
      isMounted = false
    }
  }, [navigate, templateId])

  const handleSaveTemplate = async (payload: SavedTemplatePayload) => {
    await withSaveLoader(async () => {
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
      }
    })
  }

  const handleCancel = () => {
    navigate("/budget-template")
  }

  if (isLoading) {
    return (
      <CardContent className="flex min-h-[360px] items-center justify-center p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="h-5 w-5 text-primary" />
          <span>Loading template...</span>
        </div>
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
