import { useCallback, useEffect, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardTitle } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Edit,
  Plus,
  Trash,
  X,
} from "lucide-react"
import { toast } from "sonner"
import type {
  BudgetTemplateItem,
  BudgetTemplateSubCategory,
} from "@/features/budget/types"
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

function normalizeName(value: string) {
  return value.trim().toLowerCase()
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
  const [itemName, setItemName] = useState("")
  const [pendingItems, setPendingItems] = useState<BudgetTemplateItem[]>([])
  const [subCategoryName, setSubCategoryName] = useState("")
  const [subItemName, setSubItemName] = useState("")
  const [pendingSubItems, setPendingSubItems] = useState<BudgetTemplateItem[]>(
    []
  )
  const [pendingSubCategories, setPendingSubCategories] = useState<
    BudgetTemplateSubCategory[]
  >([])
  const [categories, setCategories] =
    useState<TemplateCategory[]>(initialCategories)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  useEffect(() => {
    setTemplateName(initialName)
  }, [initialName])

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  const resetCategoryForm = useCallback(() => {
    setCategoryName("")
    setItemName("")
    setPendingItems([])
    setSubCategoryName("")
    setSubItemName("")
    setPendingSubItems([])
    setPendingSubCategories([])
    setEditIndex(null)
  }, [])

  const handleAddItem = useCallback(() => {
    const value = itemName.trim()
    if (!value) {
      return toast.error("Enter an item name")
    }

    const duplicate = pendingItems.some(
      (item) => normalizeName(item.name) === normalizeName(value)
    )
    if (duplicate) {
      return toast.error("Duplicate item")
    }

    setPendingItems((prev) => [...prev, { name: value }])
    setItemName("")
  }, [itemName, pendingItems])

  const handleAddSubItem = useCallback(() => {
    const value = subItemName.trim()
    if (!value) {
      return toast.error("Enter a sub-item name")
    }

    const duplicate = pendingSubItems.some(
      (item) => normalizeName(item.name) === normalizeName(value)
    )
    if (duplicate) {
      return toast.error("Duplicate sub-item")
    }

    setPendingSubItems((prev) => [...prev, { name: value }])
    setSubItemName("")
  }, [pendingSubItems, subItemName])

  const handleSaveSubCategory = useCallback(() => {
    const value = subCategoryName.trim()
    if (!value) {
      return toast.error("Enter a subcategory name")
    }

    if (pendingSubItems.length < 2) {
      return toast.error("Add at least two sub-items for multiplication")
    }

    const duplicate = pendingSubCategories.some(
      (subCategory) =>
        normalizeName(subCategory.name) === normalizeName(value)
    )
    if (duplicate) {
      return toast.error("Duplicate subcategory")
    }

    setPendingSubCategories((prev) => [
      ...prev,
      {
        name: value,
        items: pendingSubItems,
      },
    ])
    setSubCategoryName("")
    setSubItemName("")
    setPendingSubItems([])
  }, [pendingSubCategories, pendingSubItems, subCategoryName])

  const handleSaveCategory = () => {
    const value = categoryName.trim()
    if (!value) {
      return toast.error("Provide a category name")
    }

    if (pendingItems.length === 0 && pendingSubCategories.length === 0) {
      return toast.error("Add category items or subcategories")
    }

    const newCategory: TemplateCategory = {
      category: value,
      items: pendingItems,
      subCategories: pendingSubCategories,
    }

    setCategories((prev) => {
      const updated = [...prev]
      if (editIndex !== null) {
        updated[editIndex] = newCategory
      } else {
        updated.push(newCategory)
      }
      return updated
    })

    resetCategoryForm()
  }

  const handleEditCategory = (index: number) => {
    const target = categories[index]
    setCategoryName(target.category)
    setPendingItems(target.items)
    setPendingSubCategories(target.subCategories ?? [])
    setSubCategoryName("")
    setSubItemName("")
    setPendingSubItems([])
    setEditIndex(index)
  }

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      return toast.error("Template name is required")
    }

    if (categories.length === 0) {
      return toast.error("Add at least one category")
    }

    await onSave({ name: templateName.trim(), categories })
  }

  if (!isOpen) return null

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Card className="flex h-full flex-col border-none bg-card shadow-none">
        <header className="flex shrink-0 items-center gap-2 border-b px-6 py-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl">Template Editor</CardTitle>
        </header>

        <CardContent className="grid flex-1 gap-6 overflow-hidden p-6 lg:grid-cols-2">
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
              <div className="space-y-6 py-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold tracking-tight text-primary uppercase">
                    {editIndex !== null ? "Edit Category" : "Add New Category"}
                  </h3>
                  <label className="text-xs font-medium">Category Label</label>
                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., Concept development"
                  />
                </div>

                <div className="space-y-3 rounded-lg border p-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">
                      Category Items
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddItem()
                          }
                        }}
                        placeholder="Add direct item..."
                      />
                      <Button onClick={handleAddItem} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {pendingItems.map((item) => (
                      <span
                        key={item.name}
                        className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium"
                      >
                        {item.name}
                        <button
                          onClick={() =>
                            setPendingItems((prev) =>
                              prev.filter(
                                (candidate) => candidate.name !== item.name
                              )
                            )
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border p-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">
                      Multiplied Subcategory
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      The subcategory total row will be calculated as the
                      product of its sub-items and included in the category
                      total.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">
                      Subcategory Name
                    </label>
                    <Input
                      value={subCategoryName}
                      onChange={(e) => setSubCategoryName(e.target.value)}
                      placeholder="e.g., Concept manufacturing"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">Sub-items</label>
                    <div className="flex gap-2">
                      <Input
                        value={subItemName}
                        onChange={(e) => setSubItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddSubItem()
                          }
                        }}
                        placeholder="e.g., Quantity for concept development"
                      />
                      <Button onClick={handleAddSubItem} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {pendingSubItems.map((item) => (
                      <span
                        key={item.name}
                        className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium"
                      >
                        {item.name}
                        <button
                          onClick={() =>
                            setPendingSubItems((prev) =>
                              prev.filter(
                                (candidate) => candidate.name !== item.name
                              )
                            )
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleSaveSubCategory}
                    disabled={!subCategoryName.trim()}
                  >
                    Save Subcategory
                  </Button>

                  <div className="space-y-2">
                    {pendingSubCategories.map((subCategory) => (
                      <div
                        key={subCategory.name}
                        className="rounded-lg border bg-background p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">
                              {subCategory.name}
                            </p>
                            <p className="text-[10px] uppercase text-muted-foreground">
                              multiplied from {subCategory.items.length} sub-items
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() =>
                              setPendingSubCategories((prev) =>
                                prev.filter(
                                  (candidate) =>
                                    candidate.name !== subCategory.name
                                )
                              )
                            }
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <ul className="space-y-1">
                          {subCategory.items.map((item) => (
                            <li
                              key={item.name}
                              className="text-xs text-muted-foreground"
                            >
                              {item.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex shrink-0 gap-3 pt-4">
              <Button onClick={handleSaveCategory}>
                {editIndex !== null ? "Update Category" : "Add to Preview"}
              </Button>
              {editIndex !== null && (
                <Button variant="outline" onClick={resetCategoryForm}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </section>

          <section className="flex flex-col overflow-hidden rounded-xl border bg-card p-6">
            <div className="mb-4 flex shrink-0 items-center justify-between border-b pb-2">
              <span className="font-bold">Live Preview</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold">
                {categories.length}{" "}
                {categories.length === 1 ? "CATEGORY" : "CATEGORIES"}
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
                  categories.map((category, idx) => (
                    <div
                      key={`${category.category}-${idx}`}
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
                              {category.category}
                            </p>
                            <p className="text-[10px] uppercase text-muted-foreground">
                              {category.items.length} direct items,{" "}
                              {(category.subCategories ?? []).length} multiplied
                              subcategories
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
                              setCategories((prev) =>
                                prev.filter((_, index) => index !== idx)
                              )
                            }
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {expandedIndex === idx && (
                        <div className="space-y-3 bg-muted/30 px-6 pt-2 pb-4">
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                              Direct Items
                            </p>
                            {(category.items ?? []).map((item) => (
                              <div
                                key={item.name}
                                className="text-xs text-muted-foreground"
                              >
                                {item.name}
                              </div>
                            ))}
                          </div>

                          {(category.subCategories ?? []).map((subCategory) => (
                            <div key={subCategory.name} className="space-y-1">
                              <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                                {subCategory.name}
                              </p>
                              {subCategory.items.map((item) => (
                                <div
                                  key={item.name}
                                  className="pl-4 text-xs text-muted-foreground"
                                >
                                  {item.name}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
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
