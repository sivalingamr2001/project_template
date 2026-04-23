import { useMemo, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Edit, Plus, Trash, X } from "lucide-react"
import { toast } from "sonner"
import type { TemplateCategory } from "@/features/budget/utils/budgetTemplates"

type TemplateEditorProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (template: { name: string; categories: TemplateCategory[] }) => void
}

export function TemplateEditor({
  isOpen,
  onClose,
  onSave,
}: TemplateEditorProps) {
  const [templateName, setTemplateName] = useState("")
  const [categoryName, setCategoryName] = useState("")
  const [subCategoryName, setSubCategoryName] = useState("")
  const [pendingItems, setPendingItems] = useState<string[]>([])
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const handleAddSubcategory = () => {
    const trimmed = subCategoryName.trim()
    if (!trimmed) {
      toast.error("Enter a subcategory before adding.")
      return
    }
    if (pendingItems.includes(trimmed)) {
      toast.error("This subcategory is already added.")
      return
    }
    setPendingItems((current) => [...current, trimmed])
    setSubCategoryName("")
  }

  const handleSaveCategory = () => {
    const trimmedCategory = categoryName.trim()
    if (!trimmedCategory) {
      toast.error("Provide a category name.")
      return
    }
    if (pendingItems.length === 0) {
      toast.error("Add at least one subcategory.")
      return
    }

    const newCategory: TemplateCategory = {
      category: trimmedCategory,
      items: pendingItems,
    }

    if (editIndex !== null) {
      setCategories((current) =>
        current.map((item, index) => (index === editIndex ? newCategory : item))
      )
      setEditIndex(null)
    } else {
      setCategories((current) => [...current, newCategory])
    }

    setCategoryName("")
    setSubCategoryName("")
    setPendingItems([])
  }

  const handleEditCategory = (index: number) => {
    const category = categories[index]
    setCategoryName(category.category)
    setPendingItems(category.items)
    setEditIndex(index)
  }

  const handleDeleteCategory = (index: number) => {
    setCategories((current) => current.filter((_, idx) => idx !== index))
    if (editIndex === index) {
      setCategoryName("")
      setPendingItems([])
      setSubCategoryName("")
      setEditIndex(null)
    }
  }

  const handleSaveTemplate = () => {
    const trimmedTemplateName = templateName.trim()
    if (!trimmedTemplateName) {
      toast.error("Provide a template name.")
      return
    }
    if (categories.length === 0) {
      toast.error("Add at least one category before saving.")
      return
    }
    onSave({ name: trimmedTemplateName, categories })
    setTemplateName("")
    setCategoryName("")
    setSubCategoryName("")
    setPendingItems([])
    setCategories([])
    setEditIndex(null)
    onClose()
    toast.success("Template saved.")
  }

  const jsonPreview = useMemo(
    () => JSON.stringify(categories, null, 2),
    [categories]
  )

  if (!isOpen) {
    return null
  }

  return (
    <Card className="rounded-3xl border border-border bg-card">
      <CardHeader className="p-6">
        <CardTitle className="text-2xl">Template Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6 rounded-3xl border border-border bg-background/80 p-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Template Name
              </label>
              <Input
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Category Name
              </label>
              <Input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Example: Product Design"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Subcategory Name
              </label>
              <div className="flex gap-2">
                <Input
                  value={subCategoryName}
                  onChange={(event) => setSubCategoryName(event.target.value)}
                  placeholder="Example: CFD Analysis"
                />
                <Button
                  onClick={handleAddSubcategory}
                  size="sm"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {pendingItems.length > 0 && (
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">
                  Current subcategories
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {pendingItems.map((item) => (
                    <li
                      key={item}
                      className="rounded-xl bg-slate-950/80 px-3 py-2"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={handleSaveCategory}>
                {editIndex !== null ? "Update Category" : "Add Category"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCategoryName("")
                  setSubCategoryName("")
                  setPendingItems([])
                  setEditIndex(null)
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-border bg-background/80 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Live Preview
                </p>
                <p className="text-xs text-muted-foreground">
                  Review category cards, edit or delete items before saving.
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-105 rounded-3xl border border-border bg-slate-950/70 p-4">
              <div className="space-y-4">
                {categories.length === 0 ? (
                  <div className="rounded-3xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                    No categories added yet.
                  </div>
                ) : (
                  categories.map((category, index) => (
                    <div
                      key={`${category.category}-${index}`}
                      className="rounded-3xl border border-border/70 bg-slate-950/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {category.category}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {category.items.length} subcategories
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 rounded-full"
                            onClick={() => handleEditCategory(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 rounded-full"
                            onClick={() => handleDeleteCategory(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {category.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/10 px-3 py-2"
                          >
                            <span className="text-primary">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">
                JSON Preview
              </p>
              <div className="overflow-hidden rounded-3xl border border-border bg-background/90 p-4 text-xs text-muted-foreground">
                <pre className="whitespace-pre-wrap">{jsonPreview}</pre>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSaveTemplate}>Save Template</Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
