import { useState, useCallback, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardTitle } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import {
  ArrowLeft,
  Edit,
  Plus,
  Trash,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { toast } from "sonner"
import type { TemplateCategory } from "@/features/budget/utils/budgetTemplates"

type TemplateEditorProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (template: {
    name: string
    categories: TemplateCategory[]
  }) => void | Promise<void>
  onBack: () => void
  initialName?: string
  initialCategories?: TemplateCategory[]
  isSaving?: boolean
  submitLabel?: string
}

export function TemplateEditor({
  isOpen,
  onSave,
  onBack,
  initialName = "",
  initialCategories = [],
  isSaving = false,
  submitLabel = "Save template",
}: TemplateEditorProps) {
  const [templateName, setTemplateName] = useState(initialName)
  const [categoryName, setCategoryName] = useState("")
  const [subCategoryName, setSubCategoryName] = useState("")
  const [pendingItems, setPendingItems] = useState<string[]>([])
  const [categories, setCategories] = useState<TemplateCategory[]>(
    initialCategories
  )
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  useEffect(() => {
    setTemplateName(initialName)
  }, [initialName])

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  // --- Handlers ---
  const handleAddSubcategory = useCallback(() => {
    const val = subCategoryName.trim()
    if (!val) return toast.error("Enter a subcategory name")
    if (pendingItems.includes(val)) return toast.error("Duplicate subcategory")
    setPendingItems((prev) => [...prev, val])
    setSubCategoryName("")
  }, [subCategoryName, pendingItems])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddSubcategory()
    }
  }

  const handleSaveCategory = () => {
    const catName = categoryName.trim()
    if (!catName || pendingItems.length === 0) {
      return toast.error("Provide a name and at least one subcategory")
    }

    const newCategory = { category: catName, items: pendingItems }
    setCategories((prev) => {
      const updated = [...prev]
      if (editIndex !== null) updated[editIndex] = newCategory
      else updated.push(newCategory)
      return updated
    })

    setCategoryName("")
    setPendingItems([])
    setEditIndex(null)
  }

  const handleEditCategory = (index: number) => {
    const target = categories[index]
    setCategoryName(target.category)
    setPendingItems(target.items)
    setEditIndex(index)
  }

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return toast.error("Template name is required")
    if (categories.length === 0) return toast.error("Add at least one category")

    await onSave({ name: templateName.trim(), categories })
  }

  if (!isOpen) return null

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Card className="flex h-full flex-col border-none bg-card shadow-none">
        {/* Fixed Header */}
        <header className="flex shrink-0 items-center gap-2 border-b px-6 py-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl">Template Editor</CardTitle>
        </header>

        {/* Dynamic Content Area */}
        <CardContent className="grid flex-1 gap-6 overflow-hidden p-6 lg:grid-cols-2">
          {/* Left: Editor Form */}
          <section className="flex flex-col space-y-4 overflow-hidden rounded-xl border bg-muted/10 p-6">
            <div className="shrink-0 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Template Name</label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                />
              </div>
              <hr />
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-2">
                <h3 className="text-sm font-bold tracking-tight text-primary uppercase">
                  {editIndex !== null ? "Edit Category" : "Add New Category"}
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Category Label</label>
                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., Marketing"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Subcategories</label>
                  <div className="flex gap-2">
                    <Input
                      value={subCategoryName}
                      onChange={(e) => setSubCategoryName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type and press Enter..."
                    />
                    <Button
                      onClick={handleAddSubcategory}
                      size="icon"
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {pendingItems.map((item) => (
                      <span
                        key={item}
                        className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium"
                      >
                        {item}
                        <button
                          onClick={() =>
                            setPendingItems((p) => p.filter((i) => i !== item))
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="shrink-0 pt-4">
              <Button onClick={handleSaveCategory}>
                {editIndex !== null ? "Update Category" : "Add to Preview"}
              </Button>
            </div>
          </section>

          {/* Right: Live Preview */}
          <section className="flex flex-col overflow-hidden rounded-xl border bg-card p-6">
            <div className="mb-4 flex shrink-0 items-center justify-between border-b pb-2">
              <span className="font-bold">Live Preview</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold">
                {categories.length} {categories.length === 1 ? "ITEM" : "ITEMS"}
              </span>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3">
                {categories.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                    <p className="text-sm text-muted-foreground">
                      Preview will appear here
                    </p>
                  </div>
                ) : (
                  categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border transition-all ${editIndex === idx ? "border-primary ring-2 ring-primary" : ""}`}
                    >
                      <div className="flex items-center justify-between p-3">
                        <button
                          className="flex flex-1 items-center gap-2 text-left"
                          onClick={() =>
                            setExpandedIndex(expandedIndex === idx ? null : idx)
                          }
                        >
                          {expandedIndex === idx ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <div>
                            <p className="text-sm font-semibold">
                              {cat.category}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase">
                              {cat.items.length} items
                            </p>
                          </div>
                        </button>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditCategory(idx)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() =>
                              setCategories((c) =>
                                c.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {expandedIndex === idx && (
                        <ul className="space-y-1 bg-muted/30 px-9 pt-1 pb-3">
                          {cat.items.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <div className="h-1 w-1 rounded-full bg-primary/50" />{" "}
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="shrink-0 pt-6">
              <Button
                onClick={handleSaveTemplate}
                disabled={categories.length === 0 || !templateName || isSaving}
              >
                {isSaving ? "Saving..." : submitLabel}
              </Button>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
